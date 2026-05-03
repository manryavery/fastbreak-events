export type Event = {
  id: string
  name: string
  sport_type: string
  event_date: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Venue = {
  id: string
  event_id: string
  name: string
  address: string | null
}

export type EventWithVenues = Event & {
  venues: Venue[]
}
