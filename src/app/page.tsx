import { cn } from "@/lib/utils";
import Navbar from "./_components/navbar";
import { hammersmith } from "@/styles/fonts";
import WelcomeText from "./_components/welcome-text";
import GymQuester from "./_components/gym-quester";
import { Meteors } from "@/components/ui/meteors";
import PagePath from "./_components/page-path";
import QuestDescription from "./_components/quest-description";
import { MacbookScroll } from "@/components/ui/macboox-scroll";

export default async function Home() {
  return (
    <main className={cn(
      "dark:bg-inherit bg-neutral-200 relative",
      hammersmith.className
    )}>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center relative pt-12 pb-32">
        <Meteors />

        <div className="max-w-[1400px] w-full flex">
          <div className="flex-grow flex justify-center items-center">
            <WelcomeText />
          </div>
          <div className="flex-grow">
            <GymQuester />
          </div>
        </div>
      </section>
      <PagePath />
      <QuestDescription />
      <MacbookScroll />
    </main>
  );
}
