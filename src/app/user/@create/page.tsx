'use client'

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/trpc/react"

export default function Create () {
    const createUsersettings = api.user.createUser.useMutation()
    const { toast } = useToast()

    const onCreateUser = async () => {
        await createUsersettings.mutateAsync({
            username: 'jamera'
        })

        toast({
            title: 'Success!',
            description: 'Successfully created your user account at Gym Quest. Lets get started!'
        })
    }

    return (
        <section>
            <h1>Create user</h1>
            <Button onClick={onCreateUser}>
                Press here!!
            </Button>
        </section>
    )
}