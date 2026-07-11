import { auth } from "@/auth";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ProfileButton from "./profile-button";
import Icon from "@/components/ui/icon";
import NavbarMinimizer from "./navbar-minimizer";

export default async function Navbar () {
  const session = await auth()

  return (
    <NavbarMinimizer>
      <div className="flex min-w-0 items-center gap-6">
        <Icon displayText />
        <div className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="#community" className="transition-colors hover:text-foreground">
            Community
          </Link>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!session && (
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/signup">
              Get started
              <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        )}
        <ProfileButton session={session} />
      </div>
    </NavbarMinimizer>
  )
}
