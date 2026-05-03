import { notFound } from 'next/navigation'
import { EventForm } from '@/components/event-form'
import { getEventById } from '@/lib/actions/events'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const result = await getEventById(id)

  if (!result.success) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit Event</h1>
      <EventForm event={result.data} />
    </main>
  )
}
