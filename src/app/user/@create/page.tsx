'use client'

import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { toast } from "sonner"

export default function Create () {
    const createUsersettings = api.user.createUser.useMutation()

    const onCreateUser = async () => {
        await createUsersettings.mutateAsync({
            username: 'jamera'
        })

        toast.success('Success!', {
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