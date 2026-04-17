import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const discoverUserSelect = {
  id: true,
  handle: true,
  displayName: true,
  image: true,
  avatarStorageKey: true,
} satisfies Prisma.UserSelect

export type DiscoverUser = Prisma.UserGetPayload<{ select: typeof discoverUserSelect }>

function notFollowedByViewerWhere(viewerId: string): Prisma.UserWhereInput {
  return {
    id: { not: viewerId },
    followsReceived: { none: { followerId: viewerId } },
  }
}

export async function getFolloweeIdsFollowedByViewer(viewerId: string, followeeIds: string[]) {
  if (followeeIds.length === 0) return new Set<string>()
  const rows = await prisma.follow.findMany({
    where: { followerId: viewerId, followeeId: { in: followeeIds } },
    select: { followeeId: true },
  })
  return new Set(rows.map((r) => r.followeeId))
}

export async function searchUsers(input: { viewerId: string; query: string; take?: number }) {
  const q = input.query.trim()
  if (q.length < 2) return [] as DiscoverUser[]

  const take = input.take ?? 20

  return prisma.user.findMany({
    where: {
      id: { not: input.viewerId },
      OR: [
        { handle: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: discoverUserSelect,
    take,
    orderBy: [{ displayName: "asc" }, { handle: "asc" }],
  })
}

export async function listSuggestedFollowees(input: { viewerId: string; take?: number }) {
  const take = input.take ?? 12

  return prisma.user.findMany({
    where: notFollowedByViewerWhere(input.viewerId),
    select: discoverUserSelect,
    take,
    orderBy: { followsReceived: { _count: "desc" } },
  })
}

export async function listSuggestedCreators(input: { viewerId: string; take?: number }) {
  const take = input.take ?? 12

  return prisma.user.findMany({
    where: {
      ...notFollowedByViewerWhere(input.viewerId),
      posts: { some: {} },
    },
    select: discoverUserSelect,
    take,
    orderBy: { posts: { _count: "desc" } },
  })
}
