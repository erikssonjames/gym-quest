import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/trpc/react"
import { Loader2, Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

export function AddFriend () {
  const { data: users } = api.user.getUsers.useQuery()
  const { data: friendRequests } = api.user.getFriendRequests.useQuery()
  const { data: friends } = api.user.getFriends.useQuery()


  const [search, setSearch] = useState("")

  const filteredUsers = users
    ? users.filter(user => {
      const isFriend = friends?.some(friend => friend.id === user.id) ?? false

      return user.username?.toLowerCase().includes(search.toLowerCase()) && !isFriend
    })
    : []

  const hasPendingRequest = useCallback((userId: string) => {
    if (!friendRequests) return false

    return [
      ...friendRequests.outgoing,
      ...friendRequests.incoming
    ].some(req => (req.fromUserId === userId || req.toUserId === userId) && !req.accepted && !req.ignored)
  }, [friendRequests])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <Plus /> <span className="hidden md:inline">Add Friend</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a new Friend</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <Input placeholder="Search by username" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <ScrollArea className="w-full h-[400px]">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex gap-4 items-center justify-between hover:bg-secondary/50 p-2 rounded-md group">
              <div className="flex gap-4 items-center">
                <Avatar className="size-7 text-sm">
                  <AvatarImage src={user.uploadedImage ?? user.image ?? ""} alt={user.username?.at(0) ?? ""} />
                  <AvatarFallback>{user.username?.at(0) ?? ""}</AvatarFallback>
                </Avatar>
                {user.username}
              </div>

              {hasPendingRequest(user.id) ? (
                <div className="">
                  <p className="text-xs">Pending request active!</p>
                </div>
              ) : (
                <SendFriendRequestButton userId={user.id} />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function SendFriendRequestButton ({ userId }: { userId: string }) {
  const utils = api.useUtils()
  const { mutate, isPending: sendFriendRequestPending } = api.user.sendFriendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request sent!")
      void utils.user.getFriendRequests.invalidate()
    },
    onError: (error) => {
      console.log('error', error)
      toast.error("Could not send a friend request...")
    }
  })

  return (
    <Button
      className="h-7" 
      size="sm" 
      onClick={() => mutate(userId)}
      disabled={sendFriendRequestPending}
    >
      <span className="hidden md:inline">Add Friend</span>
      {sendFriendRequestPending ? <Loader2 className="animate-spin" /> : <Plus />}
    </Button>
  )
}