'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/trpc/react"
import { useDebounce } from "@uidotdev/usehooks"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Create () {
  const router = useRouter()
  const { mutateAsync: createUser, isPending: creatingUserPending } = api.user.createUser.useMutation()
  const { mutate: checkUsername, isPending, data } = api.user.checkIfUsernameIsAvailable.useMutation()

  const [username, setUsername] = useState("")
  const debouncedUsername = useDebounce(username, 500)

  const onCreateUser = async () => {
    await createUser({ username })

    toast.success('Success!', {
      description: 'Successfully created your user account at Gym Quest. Lets get started!'
    })

    router.replace("/user")
  }

  useEffect(() => {
    if (debouncedUsername.length > 2) checkUsername(debouncedUsername)
  }, [debouncedUsername, checkUsername])

  return (
    <section className="w-screen h-screen flex items-center justify-center">
      <div className="flex gap-10 flex-col min-w-96 relative">
        <div>
          <h1 className="font-semibold text-xl">Welcome!</h1>
          <p className="text-muted-foreground text-sm">Seems like this is your first visit.</p>
        </div>

        <div className="space-y-2">
          <Input 
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="h-5 w-full">
            {data && !data.available && !isPending && (
              <p className="text-sm text-destructive">Username {data.username} is taken.</p>
            )}
          </div>
        </div>

        <div className="absolute -bottom-16 left-0 right-0">
          {debouncedUsername.length > 2 && data && data.available && data.username === username && (
            <Button onClick={onCreateUser} disabled={isPending} className="w-full">
              {creatingUserPending
                ? (
                  <>
                    Creating User
                    <Loader2 className="animate-spin" />
                  </>
                )
                : "Create User"
              }
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}