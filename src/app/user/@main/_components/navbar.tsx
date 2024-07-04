'use client'

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Image from "next/image";

export default function Navbar () {
    return (
        <header className="sticky bg-background flex items-center h-16 border-b px-4 md:px-6">
            <div>
                <Image
                    alt="Logo"
                    src="/icon/favicon-32x32.png"
                    width={32}
                    height={32}
                    fill={false}
                    className="object-contain"
                />
            </div>
            <div className="ml-auto flex gap-2">
                <ModeToggle />
                <Button onClick={() => signOut()}>
                    Sign out
                </Button>
            </div>
        </header>
    )
}