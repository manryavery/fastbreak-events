'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { actionWrapper, type ActionResult } from './helpers'
import type { Event, EventWithVenues } from '../types'

type GetEventsParams = {
  search?: string
  sport?: string
}

export type CreateEventInput = {
  name: string
  sport_type: string
  event_date: string
  description?: string
  venues: { name: string; address?: string }[]
}

export type UpdateEventInput = {
  name: string
  sport_type: string
  event_date: string
  description?: string
  venues: { id?: string; name: string; address?: string }[]
}

export async function getEvents(
  params: GetEventsParams = {}
): Promise<ActionResult<EventWithVenues[]>> {
  return actionWrapper(async () => {
    const supabase = await createClient()
    let query = supabase
      .from('events')
      .select('*, venues(*)')
      .order('event_date', { ascending: true })

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`)
    }
    if (params.sport) {
      query = query.eq('sport_type', params.sport)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []) as EventWithVenues[]
  })
}

export async function getSportTypes(): Promise<ActionResult<string[]>> {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('events').select('sport_type')
    if (error) throw new Error(error.message)
    const types = Array.from(
      new Set((data ?? []).map((row) => row.sport_type as string))
    )
    types.sort()
    return types
  })
}

export async function createEvent(
  input: CreateEventInput
): Promise<ActionResult<Event>> {
  return actionWrapper(async () => {
    const supabase = await createClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name: input.name,
        sport_type: input.sport_type,
        event_date: new Date(input.event_date).toISOString(),
        description: input.description?.trim() ? input.description : null,
      })
      .select()
      .single()

    if (eventError) throw new Error(eventError.message)

    const venuesToInsert = input.venues.map((v) => ({
      event_id: event.id,
      name: v.name,
      address: v.address?.trim() ? v.address : null,
    }))

    const { error: venuesError } = await supabase
      .from('venues')
      .insert(venuesToInsert)

    if (venuesError) throw new Error(venuesError.message)

    revalidatePath('/')
    return event as Event
  })
}

export async function getEventById(
  id: string
): Promise<ActionResult<EventWithVenues>> {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*, venues(*)')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('Event not found')
    return data as EventWithVenues
  })
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput
): Promise<ActionResult<Event>> {
  return actionWrapper(async () => {
    const supabase = await createClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({
        name: input.name,
        sport_type: input.sport_type,
        event_date: new Date(input.event_date).toISOString(),
        description: input.description?.trim() ? input.description : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (eventError) throw new Error(eventError.message)

    const { data: existingVenues, error: fetchError } = await supabase
      .from('venues')
      .select('id')
      .eq('event_id', id)

    if (fetchError) throw new Error(fetchError.message)

    const submittedIds = new Set(
      input.venues.filter((v) => v.id).map((v) => v.id as string)
    )
    const idsToDelete = (existingVenues ?? [])
      .map((v) => v.id as string)
      .filter((existingId) => !submittedIds.has(existingId))

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('venues')
        .delete()
        .in('id', idsToDelete)
      if (deleteError) throw new Error(deleteError.message)
    }

    for (const venue of input.venues.filter((v) => v.id)) {
      const { error: updateError } = await supabase
        .from('venues')
        .update({
          name: venue.name,
          address: venue.address?.trim() ? venue.address : null,
        })
        .eq('id', venue.id as string)
      if (updateError) throw new Error(updateError.message)
    }

    const venuesToInsert = input.venues
      .filter((v) => !v.id)
      .map((v) => ({
        event_id: id,
        name: v.name,
        address: v.address?.trim() ? v.address : null,
      }))

    if (venuesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('venues')
        .insert(venuesToInsert)
      if (insertError) throw new Error(insertError.message)
    }

    revalidatePath('/')
    revalidatePath(`/events/${id}/edit`)
    return event as Event
  })
}

export async function deleteEvent(id: string): Promise<ActionResult<null>> {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    return null
  })
}
