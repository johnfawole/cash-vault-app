import { WaitlistForm } from "@/components/waitlist-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to home
        </Link>

        <WaitlistForm />
      </div>
    </div>
  )
}
