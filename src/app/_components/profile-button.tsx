'use client'

import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

export default function ProfileButton ({ session }: { session: Session | null }) {
    return (
        <div>
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