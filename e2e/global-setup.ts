import { createClient } from "@supabase/supabase-js";

export default async function globalSetup() {
  const url = process.env.E2E_SUPABASE_URL;
  const service = process.env.E2E_SUPABASE_SERVICE_KEY;
  const email = process.env.E2E_USER_EMAIL ?? "e2e@ops.test";
  const password = process.env.E2E_USER_PASSWORD ?? "password123";
  if (!url || !service) return;

  const admin = createClient(url, service, { auth: { autoRefreshToken: false } });
  const { data } = await admin.auth.admin.listUsers();
  const existing = data?.users?.find((u) => u.email === email);
  if (!existing) {
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  }
}
