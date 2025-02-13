import { cn } from "@/lib/utils";
import Navbar from "./_components/navbar";
import { hammersmith } from "@/styles/fonts";
import WelcomeText from "./_components/welcome-text";
import GymQuester from "./_components/gym-quester";
import { Meteors } from "@/components/ui/meteors";
import PagePath from "./_components/page-path";
import QuestDescription from "./_components/quest-description";
import ShareProgress from "./_components/share-progress";
import Footer from "./_components/footer";

export default async function Home() {
  return (
    <main className={cn(
      "dark:bg-inherit bg-neutral-200 relative",
      hammersmith.className
    )}>
      <Navbar />
      <section className="h-screen max-h-[1200px] flex items-center justify-center relative md:pt-12">
        <div className="overflow-hidden h-96 w-full absolute top-0 left-0">
          <Meteors />
        </div>

        <div className="max-w-[1400px] w-full flex">
          <div className="flex-grow flex justify-center items-center md:px-0 px-4">
            <WelcomeText />
          </div>
          <div className="flex-grow lg:block hidden">
            <GymQuester />
          </div>
        </div>
      </section>
      <PagePath />
      <QuestDescription />
      <ShareProgress />
      <Footer />
    </main>
  );
}
