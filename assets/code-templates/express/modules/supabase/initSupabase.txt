import { SupabaseClient, createClient } from "@supabase/supabase-js";

export let supabaseCli: SupabaseClient;

export const initSupabase = async () => {
  let projectUrl = process.env.SUPABASE_PROJECT_URL;
  let serviceKey =
    process.env.SUPABASE_SERVICE_KEY

  supabaseCli = createClient(projectUrl, serviceKey);
  console.log("Supabase module initialised");
};
