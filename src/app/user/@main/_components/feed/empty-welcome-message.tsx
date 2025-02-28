"use client"

import { activityEmojis, emotionEmojis } from "@/variables/emojis";
import PostContainer from "./post-container";
import { ActivityEmojis } from "@/variables/emojis/activity";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionEmojis } from "@/variables/emojis/emotion";

export default function EmptyWelcomeMessage () {
  return (
    <PostContainer>
      <div className="max-w-[800px]">
        <p className="font-bold text-3xl">
            Welcome to Gym Quest! {activityEmojis[ActivityEmojis.PARTY_POPPER].emoji}
        </p>

        <p className="mt-8 text-sm">
          Thank you for being one of the first users on Gym Quest!
        </p>

        <div className="mt-4 gap-2 flex items-center">
          <div className="self-stretch w-1 bg-primary rounded-lg" />
          <p className="font-semibold">
            NOTE: Providing feedback and reporting issues/suggestions is completely optional — but greatly appreciated!
          </p>
        </div>

        <p className="text-sm mt-4">
          Since Gym Quest is in its very early stages, we rely heavily on your help and feedback to improve the app. Before you get started, please read this short message!
        </p>

        <p className="text-sm mt-4">
          As you explore, you might come across <span className="underline">bugs</span>, notice a <span className="underline">lack of information</span>, or think of <span className="underline">missing features</span> you&apos;d like to see. We hope we&apos;re already aware of most issues and actively working to address them. However, we encourage you to share any feedback you have so we can make Gym Quest better for everyone.
        </p>

        <p className="text-sm mt-4">
          To send us a report or suggestion, just click the icon in the top-right corner at any time.
        </p>

        <div className="border w-fit px-5 py-3 rounded-md mt-4 bg-background/70">
          <p className="text-xs text-muted-foreground mb-2">Icon for reporting:</p>
          <Button variant="outline" size="icon">
            <NotebookPen />
          </Button>
        </div>

        <p className="text-sm mt-4">
          We welcome any and all critique, positive or negative!
        </p>

        <p className="text-sm mt-4">
          That&apos;s it from us. Please enjoy the app 
          {emotionEmojis[EmotionEmojis.RED_HEART].emoji}
        </p>

        <p className="text-sm">
          From the <span className="font-bold">Gym Quest Team</span>
        </p>
      </div>
    </PostContainer>
  )
}