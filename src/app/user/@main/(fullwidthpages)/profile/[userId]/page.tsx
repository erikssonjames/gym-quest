"use client"

import { api } from "@/trpc/react"
import { skipToken } from "@tanstack/react-query"
import HeaderSkeleton from "../_components/header-skeleton"
import BodySkeleton from "../_components/body-skeleton"
import Header from "./_components/header"
import Body from "./_components/body"
import { useUserId } from "./_hooks/useUserId"
import { notFound } from "next/navigation"

export default function UserProfilePage () {
  const userId = useUserId()
  const { isPending, isError } = api.user.getUserById.useQuery(userId ? userId : skipToken)

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <HeaderSkeleton />
        <BodySkeleton />
      </div>
    )
  }

  if (isError) notFound()

  return (
    <div className="flex flex-col h-full px-10 py-6">
      <Header />
      <Body />
    </div>
  )
}
