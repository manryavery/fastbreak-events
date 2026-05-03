import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchFilter } from '@/components/search-filter'
import { DeleteEventButton } from '@/components/delete-event-button'
import { getEvents } from '@/lib/actions/events'

type Props = {
  searchParams: Promise<{ search?: string; sport?: string }>
}

export default async function Home({ searchParams }: Props) {
  const { search, sport } = await searchParams
  const eventsResult = await getEvents({ search, sport })

  const events = eventsResult.success ? eventsResult.data : []
  const hasFilters = Boolean(search || sport)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <SearchFilter />

      {!eventsResult.success ? (
        <p className="mt-8 text-destructive">
          Error loading events: {eventsResult.error}
        </p>
      ) : events.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">
            {hasFilters
              ? 'No events match your filters.'
              : 'No events yet.'}
          </p>
          {!hasFilters && (
            <p className="mt-2 text-sm text-muted-foreground">
              Click &ldquo;Create Event&rdquo; to add your first one.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{event.name}</CardTitle>
                  <Badge>{event.sport_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {new Date(event.event_date).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.venues.length}{' '}
                  {event.venues.length === 1 ? 'venue' : 'venues'}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteEventButton eventId={event.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
