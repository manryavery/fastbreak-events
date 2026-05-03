import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          Fastbreak Events
        </Link>
        <Button asChild>
          <Link href="/events/new">Create Event</Link>
        </Button>
      </nav>
    </header>
  )
}
