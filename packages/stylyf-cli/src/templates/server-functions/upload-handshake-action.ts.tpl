import { action } from "@solidjs/router";
import { createPresignedUpload, type UploadIntent } from "~/lib/storage";
{{AUTH_IMPORT}}

export const {{EXPORT_NAME}} = action(async (input: UploadIntent) => {
  "use server";
{{AUTH_CALL}}
  return createPresignedUpload(input);
}, "{{QUERY_KEY}}");
