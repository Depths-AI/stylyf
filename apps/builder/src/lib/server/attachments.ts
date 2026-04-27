import { randomUUID } from "node:crypto";
import { getAttachmentDefinition, getAttachmentEntry } from "~/lib/attachments";
import { resourcesByName } from "~/lib/resources";
import { buildObjectUrl, createPresignedUpload, deleteObject, storagePolicy } from "~/lib/storage";
import { createSupabaseServerClient } from "~/lib/supabase";
import { getViewerIdentity, requireViewerIdentity } from "~/lib/server/resource-policy";

const DEFAULT_BUCKET_ALIAS = "uploads";

export type AttachmentIntentInput = {
  resource: string;
  attachment: string;
  resourceId: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
  metadata?: Record<string, unknown> | null;
  replaceAssetId?: string | null;
};

export type AttachmentConfirmInput = {
  resource: string;
  attachment: string;
  resourceId: string;
  assetId: string;
  contentType?: string;
  fileSize?: number;
  metadata?: Record<string, unknown> | null;
  replaceAssetId?: string | null;
};

export type AttachmentDeleteInput = {
  resource: string;
  attachment: string;
  resourceId: string;
  assetId: string;
};

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function getResourceDefinition(resourceName: string) {
  const resource = (resourcesByName as Record<string, any>)[resourceName] as any;
  if (!resource) throw new Error(`Unknown resource: ${resourceName}`);
  return resource;
}

function mutationAccessFor(resource: ReturnType<typeof getResourceDefinition>) {
  return (resource.access?.update ?? resource.access?.create ?? "user") as string;
}

function buildAttachmentObjectKey(input: { bucketAlias: string; resource: string; resourceId: string; attachment: string; assetId: string; fileName: string }) {
  const safeFileName = sanitizeFileName(input.fileName || "upload.bin");
  return `${storagePolicy.keyPrefix}/${input.bucketAlias}/${input.resource}/${input.resourceId}/${input.attachment}/${input.assetId}-${safeFileName}`;
}

async function assertSupabaseMutationAccess(resourceName: string, resourceId: string) {
  const resource = getResourceDefinition(resourceName);
  const supabase = createSupabaseServerClient() as any;
  const tableName = resource.table ?? resource.name;
  const policy = mutationAccessFor(resource);
  const ownerField = resource.ownership?.ownerField ?? "owner_id";
  const workspaceField = resource.ownership?.workspaceField ?? "workspace_id";

  switch (policy) {
    case "public": {
      const { data, error } = await supabase.from(tableName).select("id").eq("id", resourceId).limit(1);
      if (error) throw error;
      if (!data?.[0]) throw new Error("Resource not found or not accessible.");
      return { resource, userId: null as string | null };
    }
    case "user": {
      const { userId } = await requireViewerIdentity();
      const { data, error } = await supabase.from(tableName).select("id").eq("id", resourceId).limit(1);
      if (error) throw error;
      if (!data?.[0]) throw new Error("Resource not found or not accessible.");
      return { resource, userId };
    }
    case "admin": {
      await requireViewerIdentity();
      throw new Error("Admin access preset requires explicit role wiring. Generated defaults fail closed until you customize this policy.");
    }
    case "owner": {
      const { userId } = await requireViewerIdentity();
      const { data, error } = await supabase.from(tableName).select("id").eq("id", resourceId).eq(ownerField, userId).limit(1);
      if (error) throw error;
      if (!data?.[0]) throw new Error("Resource not found or not accessible.");
      return { resource, userId };
    }
    case "owner-or-public": {
      const viewer = await getViewerIdentity();
      let statement = supabase.from(tableName).select("id").eq("id", resourceId).limit(1);
      statement = viewer.userId ? statement.or(`${ownerField}.eq.${viewer.userId},is_public.eq.true`) : statement.eq("is_public", true);
      const { data, error } = await statement;
      if (error) throw error;
      if (!data?.[0]) throw new Error("Resource not found or not accessible.");
      return { resource, userId: viewer.userId };
    }
    case "workspace-member": {
      const { userId } = await requireViewerIdentity();
      const membershipTable = resource.ownership?.membershipTable ?? "workspace_memberships";
      const { data: memberships, error: membershipError } = await supabase.from(membershipTable).select(workspaceField).eq("user_id", userId);
      if (membershipError) throw membershipError;
      const workspaceIds = memberships?.map((row: any) => row[workspaceField]).filter(Boolean) ?? [];
      if (workspaceIds.length === 0) throw new Error("Resource not found or not accessible.");
      const { data, error } = await supabase.from(tableName).select("id").eq("id", resourceId).in(workspaceField, workspaceIds).limit(1);
      if (error) throw error;
      if (!data?.[0]) throw new Error("Resource not found or not accessible.");
      return { resource, userId };
    }
  }
}

async function loadSupabaseAssetRecord(input: AttachmentDeleteInput | AttachmentConfirmInput, requirePending = false) {
  await assertSupabaseMutationAccess(input.resource, input.resourceId);
  const entry = getAttachmentEntry(input.resource);
  const definition = getAttachmentDefinition(input.resource, input.attachment);
  const supabase = createSupabaseServerClient() as any;
  const { data, error } = await supabase
    .from(entry.table)
    .select("*")
    .eq("id", input.assetId)
    .eq("resource_id", input.resourceId)
    .eq("attachment_name", input.attachment)
    .limit(1);
  if (error) throw error;
  const asset = data?.[0];
  if (!asset) throw new Error("Attachment record not found.");
  if (requirePending && asset.status !== "pending") throw new Error("Attachment upload is not pending.");
  return { supabase, tableName: entry.table, asset, definition };
}

export async function createAttachmentUploadIntent(input: AttachmentIntentInput) {
  const definition = getAttachmentDefinition(input.resource, input.attachment);
  await assertSupabaseMutationAccess(input.resource, input.resourceId);
  const entry = getAttachmentEntry(input.resource);
  const supabase = createSupabaseServerClient() as any;
  const assetId = randomUUID();
  const bucketAlias = definition.bucketAlias ?? DEFAULT_BUCKET_ALIAS;
  const objectKey = buildAttachmentObjectKey({
    bucketAlias,
    resource: input.resource,
    resourceId: input.resourceId,
    attachment: input.attachment,
    assetId,
    fileName: input.fileName,
  });
  const upload = await createPresignedUpload({ key: objectKey, contentType: input.contentType, fileSize: input.fileSize });
  const { error } = await supabase.from(entry.table).insert({
    id: assetId,
    resource_id: input.resourceId,
    attachment_name: input.attachment,
    bucket_alias: bucketAlias,
    object_key: objectKey,
    object_url: null,
    file_name: input.fileName,
    content_type: input.contentType,
    file_size: input.fileSize ?? null,
    kind: definition.kind,
    status: "pending",
    metadata: input.metadata ?? null,
    replaced_by_asset_id: null,
    deleted_at: null,
  });
  if (error) throw error;
  return {
    assetId,
    bucketAlias,
    objectKey,
    upload,
  };
}

export async function createAttachmentReplacementIntent(input: AttachmentIntentInput & { replaceAssetId: string }) {
  return createAttachmentUploadIntent(input);
}

export async function confirmAttachment(input: AttachmentConfirmInput) {
  const { supabase, tableName, asset, definition } = await loadSupabaseAssetRecord(input, true);
  const priorResponse = input.replaceAssetId
    ? await supabase.from(tableName).select("*").eq("id", input.replaceAssetId).eq("resource_id", input.resourceId).eq("attachment_name", input.attachment).eq("status", "attached").limit(1)
    : definition.multiple
      ? { data: [], error: null }
      : await supabase.from(tableName).select("*").eq("resource_id", input.resourceId).eq("attachment_name", input.attachment).eq("status", "attached").neq("id", input.assetId);
  if (priorResponse.error) throw priorResponse.error;
  const priorRows = priorResponse.data ?? [];

  for (const prior of priorRows) {
    if (prior.object_key) {
      await deleteObject(prior.object_key);
    }
    const { error } = await supabase.from(tableName).update({
      status: "replaced",
      replaced_by_asset_id: input.assetId,
      deleted_at: new Date().toISOString(),
    }).eq("id", prior.id);
    if (error) throw error;
  }

  const objectUrl = buildObjectUrl(asset.object_key);
  const { data, error } = await supabase.from(tableName).update({
    status: "attached",
    object_url: objectUrl,
    content_type: input.contentType ?? asset.content_type ?? null,
    file_size: input.fileSize ?? asset.file_size ?? null,
    metadata: input.metadata ?? asset.metadata ?? null,
    deleted_at: null,
  }).eq("id", input.assetId).select("*").limit(1);
  if (error) throw error;
  return {
    asset: data?.[0] ?? { ...asset, object_url: objectUrl, status: "attached" },
    replacedAssetIds: priorRows.map((row: any) => row.id),
  };
}

export async function deleteAttachment(input: AttachmentDeleteInput) {
  const { supabase, tableName, asset } = await loadSupabaseAssetRecord(input);
  if (asset.status !== "deleted" && asset.object_key) {
    await deleteObject(asset.object_key);
  }
  const { data, error } = await supabase.from(tableName).update({
    status: "deleted",
    deleted_at: new Date().toISOString(),
  }).eq("id", input.assetId).select("*").limit(1);
  if (error) throw error;
  return data?.[0] ?? { ...asset, status: "deleted", deleted_at: new Date().toISOString() };
}
