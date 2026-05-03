import { EventForm } from '@/components/event-form'

export default function NewEventPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Create Event</h1>
      <EventForm />
    </main>
  )
}
