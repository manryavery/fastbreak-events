'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEvent, updateEvent } from '@/lib/actions/events'
import type { EventWithVenues } from '@/lib/types'

const SPORTS = [
  'Soccer',
  'Basketball',
  'Tennis',
  'Football',
  'Baseball',
  'Hockey',
  'Other',
] as const

const eventFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  sport_type: z.enum(SPORTS),
  event_date: z.string().min(1, 'Date and time is required'),
  description: z.string().optional(),
  venues: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Venue name is required'),
        address: z.string().optional(),
      })
    )
    .min(1, 'At least one venue is required'),
})

type EventFormValues = z.infer<typeof eventFormSchema>

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type Props = {
  event?: EventWithVenues
}

export function EventForm({ event }: Props) {
  const router = useRouter()
  const isEdit = Boolean(event)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
          name: event.name,
          sport_type: event.sport_type as (typeof SPORTS)[number],
          event_date: toDateTimeLocal(event.event_date),
          description: event.description ?? '',
          venues: event.venues.map((v) => ({
            id: v.id,
            name: v.name,
            address: v.address ?? '',
          })),
        }
      : {
          name: '',
          event_date: '',
          description: '',
          venues: [{ name: '', address: '' }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'venues',
  })

  async function onSubmit(values: EventFormValues) {
    const result = isEdit && event
      ? await updateEvent(event.id, values)
      : await createEvent(values)

    if (result.success) {
      toast.success(isEdit ? 'Event updated!' : 'Event created!')
      router.push('/')
    } else {
      toast.error(result.error || 'Something went wrong')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Spring Soccer Tournament" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sport_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date and Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional details about the event"
                  rows={4}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Venues</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', address: '' })}
            >
              <Plus />
              Add Venue
            </Button>
          </div>

          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="space-y-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Venue {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    aria-label={`Remove venue ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`venues.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`venues.${index}.address`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional address"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          {form.formState.errors.venues?.root?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.venues.root.message}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
              ? 'Save Changes'
              : 'Create Event'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
