import Navbar from "./_components/navbar";
import { PageShell } from "@/app/user/@main/_components/page-shell"

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell eyebrow="Community" title="Your circle" description="Keep the people, requests, and shared momentum that make training easier to return to.">
      <div className="flex flex-col gap-4">
        <Navbar />
        <div className="min-h-0">{children}</div>
      </div>
    </PageShell>
  );
}
