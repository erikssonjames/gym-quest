'use client'

import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfileButton ({ session }: { session: Session | null }) {
  return (
    <div className="flex items-center gap-2">
      {session && (
        <Button asChild variant="outline" size="sm">
          <Link href="/user">
            Dashboard
          </Link>
        </Button>
      )}
      {session ? (
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      ) : (
        <Button asChild variant="ghost" size="sm">
          <Link href="/signin">Sign in</Link>
        </Button>
      )}
    </div>
  )
}
