import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Milestone } from "lucide-react"

export default function Footer() {
  return (
    <div className="w-full dark:bg-black bg-white flex flex-col px-12 py-6">
      <div className="flex-grow max-w-[1000px] pb-12">
        <p className="text-3xl flex items-center gap-4">
          <Milestone className="text-primary" size={32} />
          <span>Work in progress</span>
        </p>
        <p className="text-muted-foreground mt-4">As this website is a hobby/side project, progress might be slow.</p>
        <p className="text-muted-foreground ">Don&apos;t hesitate to get in contact with me and get in on the project! :{')'}</p>

        <div className="mt-6">
          <div className="max-w-96 space-y-4">
            <Input placeholder="Your email" />
            <Textarea placeholder="Please introduce yourself, and what you would contribute to in this project." />
            <Button>
              <Mail className="me-2" />Send mail
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-[1000px] border-t pt-6">
        <p className="text-muted-foreground text-xs">Gym Quester @ 2025</p>

        <div className="size-4">
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>GitHub</title>
            <path className="fill-muted-foreground" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        </div>
      </div>
    </div>
  )
}