import { auth } from "@/auth";
import ProfileButton from "./profile-button";
import Icon from "@/components/ui/icon";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default async function Navbar () {
    const session = await auth()

    return (
        <nav className="fixed left-0 right-0 flex justify-between items-center p-10 z-50">
            <div>
                <Icon displayText />
            </div>
            <div className="flex gap-4 px-6">
                <ProfileButton session={session}/>
                <ModeToggle />
            </div>
        </nav>
    )
}