"use client"

import { api } from "@/trpc/react"
import { skipToken } from "@tanstack/react-query"
import HeaderSkeleton from "../_components/header-skeleton"
import BodySkeleton from "../_components/body-skeleton"
import Header from "./_components/header"
import Body from "./_components/body"
import { useUserId } from "./_hooks/useUserId"

export default function UserProfilePage () {
  const userId = useUserId()
  const { isPending } = api.user.getUserById.useQuery(userId ? userId : skipToken)

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <HeaderSkeleton />
        <BodySkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full px-10 py-6">
      <Header />
      <Body />
    </div>
  )
}