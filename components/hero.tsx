"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
              Time is money.
              <br />
              Save both.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Build discipline, lock your savings, and invest wisely. All in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 py-7 text-xl rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Test Beta
              </Button>
              <Link href="/waitlist" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-border text-foreground hover:bg-secondary font-bold px-10 py-7 text-xl rounded-lg w-full"
                >
                  Join Waitlist
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-12">
              <span>Explore product</span>
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="relative">
              <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-card">
                <img
                  src="/modern-financial-dashboard-app-interface-with-savi.jpg"
                  alt="CashVault Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                45,000+ finance teams have saved millions of hours with CashVault.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} /> */}
    </>
  )
}
