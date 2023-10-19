import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { config } from "../config";
import { Database } from "./types";

export const supabaseClient: Promise<SupabaseClient<Database>> = new Promise(
  (resolve) => {
    const client = createClient<Database>(
      config.SUPABASE_PROJECT_URL,
      config.SUPABASE_PUBLIC_KEY,
    );
    return client.auth
      .signInWithPassword({
        email: config.SUPABASE_USER,
        password: config.SUPABASE_PASSWORD,
      })
      .then(() => resolve(client));
  },
);
