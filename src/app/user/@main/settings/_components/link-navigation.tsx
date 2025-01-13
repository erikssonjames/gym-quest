'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const activeClass = "font-semibold text-primary"

export default function LinkNavigation () {
    const pathname = usePathname()

    return (
        <nav className="grid gap-4 text-sm text-muted-foreground">
            <Link 
                href="/user/settings" 
                className={pathname === "/user/settings" ? activeClass : ''}
            >
                General
            </Link>
            <Link 
                href="/user/settings/appearance"
                className={pathname === "/user/settings/appearance" ? activeClass : ''}
            >
                Appearance
            </Link>
        </nav>
    )
}