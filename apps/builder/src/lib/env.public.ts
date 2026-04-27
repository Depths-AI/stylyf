const publicSource = ((import.meta as { env?: Record<string, string | undefined> }).env ?? {}) as Record<string, string | undefined>;

function requiredPublic(name: string) {
  const value = publicSource[name];
  if (!value) throw new Error(`Missing required public env: ${name}`);
  return value;
}

function optionalPublic(name: string) {
  return publicSource[name];
}

export const publicEnv = {
  VITE_SUPABASE_URL: requiredPublic("VITE_SUPABASE_URL"),
  VITE_SUPABASE_PUBLISHABLE_KEY: requiredPublic("VITE_SUPABASE_PUBLISHABLE_KEY"),
};

export type PublicEnv = typeof publicEnv;
