import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { getAdminStatus } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const status = await getAdminStatus();
  const params = await searchParams;

  if (status.isAdmin) {
    redirect("/admin");
  }

  return (
    <main className="admin-shell login-shell">
      <form className="admin-panel login-panel" action={loginAction}>
        <p className="eyebrow">CMS Login</p>
        <h1>Portfolio Control</h1>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {params.error ? <p className="form-error">{params.error}</p> : null}
        <button className="admin-button" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
