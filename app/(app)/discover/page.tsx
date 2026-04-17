import { auth } from "@/auth"
import { UserDiscoveryRow } from "@/components/user-discovery-row/user-discovery-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getFolloweeIdsFollowedByViewer,
  listSuggestedCreators,
  listSuggestedFollowees,
  searchUsers,
} from "@/services/discover-service"

interface DiscoverPageProps {
  searchParams: Promise<{ q?: string | string[] }>
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)]
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const session = await auth()
  const viewerId = session?.user?.id
  if (!viewerId) return null

  const params = await searchParams
  const rawQ = params.q
  const q = typeof rawQ === "string" ? rawQ : Array.isArray(rawQ) ? rawQ[0] ?? "" : ""

  const searchActive = q.trim().length >= 2
  const searchResults = searchActive ? await searchUsers({ viewerId, query: q }) : []

  const [suggested, creators] = await Promise.all([
    listSuggestedFollowees({ viewerId }),
    listSuggestedCreators({ viewerId }),
  ])

  const allIds = uniqueIds([
    ...searchResults.map((u) => u.id),
    ...suggested.map((u) => u.id),
    ...creators.map((u) => u.id),
  ])
  const followingSet = await getFolloweeIdsFollowedByViewer(viewerId, allIds)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>

      <section className="space-y-3" aria-labelledby="discover-search-heading">
        <h2 id="discover-search-heading" className="text-lg font-medium">
          Search people
        </h2>
        <form action="/discover" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Name or @handle"
            className="min-h-11 text-base"
            autoComplete="off"
            aria-label="Search by name or handle"
          />
          <Button type="submit" className="min-h-11 w-full shrink-0 sm:w-auto">
            Search
          </Button>
        </form>
        {searchActive ? (
          <div className="rounded-md border">
            {searchResults.length === 0 ? (
              <p className="p-4 text-muted-foreground">No people match that search.</p>
            ) : (
              searchResults.map((user) => (
                <UserDiscoveryRow
                  key={user.id}
                  user={user}
                  viewerId={viewerId}
                  initialFollowing={followingSet.has(user.id)}
                />
              ))
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter at least 2 characters to search.</p>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="discover-suggested-heading">
        <h2 id="discover-suggested-heading" className="text-lg font-medium">
          Who to follow
        </h2>
        <div className="rounded-md border">
          {suggested.length === 0 ? (
            <p className="p-4 text-muted-foreground">No suggestions right now.</p>
          ) : (
            suggested.map((user) => (
              <UserDiscoveryRow
                key={user.id}
                user={user}
                viewerId={viewerId}
                initialFollowing={followingSet.has(user.id)}
              />
            ))
          )}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="discover-creators-heading">
        <h2 id="discover-creators-heading" className="text-lg font-medium">
          Creators for you
        </h2>
        <div className="rounded-md border">
          {creators.length === 0 ? (
            <p className="p-4 text-muted-foreground">No creators to suggest yet.</p>
          ) : (
            creators.map((user) => (
              <UserDiscoveryRow
                key={user.id}
                user={user}
                viewerId={viewerId}
                initialFollowing={followingSet.has(user.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
