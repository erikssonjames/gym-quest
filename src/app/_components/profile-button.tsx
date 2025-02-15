'use client'

import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfileButton ({ session }: { session: Session | null }) {
  return (
    <div>
      {session && (
        <Button asChild>
          <Link href="/user">
            Dashboard
          </Link>
        </Button>
      )}
      <Button variant='ghost' onClick={async () => {
        if (session) {
          await signOut()
        } else {
          await signIn()
        }
      }}>
        <span className="text-primary">{session ? 'Sign out' : 'Sign in'}</span>
      </Button>
    </div>
  )
}