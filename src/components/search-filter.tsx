'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SPORTS = [
  'Soccer',
  'Basketball',
  'Tennis',
  'Football',
  'Baseball',
  'Hockey',
  'Other',
] as const

const ALL_SPORTS = 'all'

export function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function setParam(key: 'search' | 'sport', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setParam('search', value)
    }, 400)
  }

  function onSportChange(value: string) {
    setParam('sport', value === ALL_SPORTS ? '' : value)
  }

  const currentSport = searchParams.get('sport') ?? ALL_SPORTS

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search events..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={onSearchChange}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
      />
      <Select value={currentSport} onValueChange={onSportChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Sports" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SPORTS}>All Sports</SelectItem>
          {SPORTS.map((sport) => (
            <SelectItem key={sport} value={sport}>
              {sport}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
