import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { signOutAction } from "@/app/admin/actions";
import { getAdminStatus } from "@/lib/admin/auth";
import { getPortfolioContent } from "@/lib/portfolio/storage";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const status = await getAdminStatus();

  if (status.isConfigured && !status.isAuthenticated) {
    redirect("/admin/login");
  }

  if (!status.isConfigured) {
    return <SetupPanel />;
  }

  if (!status.isAdmin) {
    return (
      <main className="admin-shell">
        <section className="admin-panel compact">
          <p className="eyebrow">Signed in</p>
          <h1>Account not allowed</h1>
          <p>
            {status.email ?? "This account"} is authenticated, but it is not in
            the `portfolio_admins` table.
          </p>
          <form action={signOutAction}>
            <button className="admin-button" type="submit">
              Sign out
            </button>
          </form>
        </section>
      </main>
    );
  }

  const content = await getPortfolioContent();

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">CMS</p>
          <h1>Portfolio Control</h1>
        </div>
        <nav>
          <Link href="/">View site</Link>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </nav>
      </header>
      <AdminEditor initialContent={content} adminEmail={status.email ?? "admin"} />
    </main>
  );
}

function SetupPanel() {
  return (
    <main className="admin-shell">
      <section className="admin-panel compact">
        <p className="eyebrow">Setup</p>
        <h1>Connect Supabase</h1>
        <p>
          Add `NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`, add a backend
          `SUPABASE_SECRET_KEY`, then run `supabase/schema.sql` in Supabase SQL
          Editor. It creates `portfolio_content`, `portfolio_assets`, and the
          `portfolio-assets` storage bucket.
        </p>
      </section>
    </main>
  );
}
