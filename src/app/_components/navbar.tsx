import { auth } from "@/auth";
import ProfileButton from "./profile-button";
import Icon from "@/components/ui/icon";
import NavbarMinimizer from "./navbar-minimizer";

export default async function Navbar () {
  const session = await auth()

  return (
    <NavbarMinimizer>
      <div>
        <Icon displayText />
      </div>
      <div className="flex gap-4 md:px-6">
        <ProfileButton session={session}/>
      </div>
    </NavbarMinimizer>
  )
}