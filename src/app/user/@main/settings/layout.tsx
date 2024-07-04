import LinkNavigation from "./_components/link-navigation";
import { H3 } from "@/components/typography/h3";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
            <H3 text="Settings" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <LinkNavigation />
            <div className="grid gap-6">
                {children}
            </div>
        </div>
    </section>
  );
}
