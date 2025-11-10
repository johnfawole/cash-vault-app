import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance text-foreground">
            Don't just take our word for it.
          </h2>
          <p className="text-lg md:text-xl mb-10 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Join thousands building lasting wealth through disciplined saving. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 py-7 text-xl rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Test Beta
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-border text-foreground hover:bg-secondary font-bold px-10 py-7 text-xl rounded-lg w-full sm:w-auto"
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
