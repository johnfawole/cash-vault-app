"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Lock, Target, TrendingUp, DollarSign, Users, Rocket } from "lucide-react"
import Link from "next/link"

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "CashVault",
      subtitle: "Save, Secure, and Grow Your Finances",
      content: (
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold text-white">CashVault</h1>
            <p className="text-2xl md:text-3xl text-gray-300">The Discipline-First Financial Platform</p>
          </div>
          <div className="pt-8">
            <p className="text-xl text-gray-400">Helping people save, secure, and grow their finances</p>
          </div>
        </div>
      ),
    },
    {
      title: "The Problem",
      content: (
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white">The Investment Trap</h2>
          <div className="space-y-6 text-xl md:text-2xl text-gray-300">
            <p>{"For too long, the financial industry has pushed one narrative:"}</p>
            <p className="text-3xl md:text-4xl font-bold text-accent pl-8">{'"Invest! Invest! Invest!"'}</p>
            <p>{"But here's the truth:"}</p>
            <ul className="space-y-4 pl-8">
              <li>• 78% of Americans live paycheck to paycheck</li>
              <li>• Most people have less than $1,000 in savings</li>
              <li>• {"Investment without savings is like building a house on sand"}</li>
            </ul>
            <p className="text-2xl font-bold text-white pt-6">Saving is the bedrock of a healthy financial life.</p>
          </div>
        </div>
      ),
    },
    {
      title: "The Solution",
      content: (
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white">CashVault: Discipline-First Banking</h2>
          <div className="space-y-6 text-xl md:text-2xl text-gray-300">
            <p>
              A platform built on the timeless principle that{" "}
              <span className="text-accent font-bold">saving comes before investing</span>.
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <Lock className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Enforce Discipline</h3>
                <p className="text-gray-400">Lock money away when willpower fails</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <Target className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Build Purpose</h3>
                <p className="text-gray-400">Save toward meaningful life goals</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <TrendingUp className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Grow Wisely</h3>
                <p className="text-gray-400">DCA into assets automatically</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Products",
      content: (
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-12">Three Core Products</h2>
          <div className="space-y-8">
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-3xl font-bold text-white mb-3">1. Safe Lock</h3>
              <p className="text-xl text-gray-300 mb-2">Lock up your money for up to 6 months</p>
              <p className="text-lg text-gray-400">
                Foster discipline and secure your financial future. No temptation, no regrets.
              </p>
            </div>
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-3xl font-bold text-white mb-3">2. Targeted Savings</h3>
              <p className="text-xl text-gray-300 mb-2">Save toward immigration, education, or your next startup</p>
              <p className="text-lg text-gray-400">
                Set goals, track progress, and achieve your dreams systematically.
              </p>
            </div>
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-3xl font-bold text-white mb-3">3. Dollar-Cost Averaging (DCA)</h3>
              <p className="text-xl text-gray-300 mb-2">Buy Bitcoin, Ethereum, and Stacks at periodic intervals</p>
              <p className="text-lg text-gray-400">
                Build wealth through consistent, automated investing without timing the market.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "The Power of Saving",
      content: (
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white">Real Numbers. Real Wealth.</h2>
          <div className="space-y-8 text-xl md:text-2xl text-gray-300">
            <p className="text-accent text-3xl font-bold">{"Can saving really make you rich?"}</p>
            <div className="bg-accent/10 border border-accent p-8 rounded-lg">
              <p className="text-2xl mb-4">Imagine: $200/week into Bitcoin</p>
              <p className="text-xl mb-2">From 2010 to 2015</p>
              <p className="text-5xl font-bold text-accent mt-6">$260,000</p>
              <p className="text-gray-400 mt-2">That would have been worth by 2021</p>
            </div>
            <p className="text-xl pt-6">{"Consistent saving + Time + Smart assets = Generational wealth"}</p>
            <p className="text-gray-400">{"You don't need to be a trader. You need to be disciplined."}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Market Opportunity",
      content: (
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white">Massive Market</h2>
          <div className="grid md:grid-cols-2 gap-8 text-lg md:text-xl">
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <DollarSign className="w-10 h-10 text-accent mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">$2.5T</h3>
                <p className="text-gray-400">US savings account market</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <Users className="w-10 h-10 text-accent mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">150M+</h3>
                <p className="text-gray-400">Adults with no emergency fund</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <TrendingUp className="w-10 h-10 text-accent mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">$4.5T</h3>
                <p className="text-gray-400">Crypto market cap (and growing)</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <Rocket className="w-10 h-10 text-accent mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Growing</h3>
                <p className="text-gray-400">Demand for disciplined financial tools</p>
              </div>
            </div>
          </div>
          <p className="text-xl text-gray-300 pt-6 text-center">
            {"We're building for the millions who know they should save but need the tools to make it happen."}
          </p>
        </div>
      ),
    },
    {
      title: "Future Vision",
      content: (
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white">What{"'"}s Next?</h2>
          <div className="space-y-6 text-xl md:text-2xl text-gray-300">
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-2xl font-bold text-white mb-2">Institutional Support</h3>
              <p className="text-gray-400">
                {"Bring CashVault's discipline-first approach to companies, DAOs, and protocols"}
              </p>
            </div>
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-2xl font-bold text-white mb-2">API & Embeds</h3>
              <p className="text-gray-400">Let other platforms integrate our savings and locking features</p>
            </div>
            <div className="border-l-4 border-accent pl-6">
              <h3 className="text-2xl font-bold text-white mb-2">Global Expansion</h3>
              <p className="text-gray-400">Help savers worldwide build financial freedom through discipline</p>
            </div>
            <div className="bg-accent/10 border border-accent p-6 rounded-lg mt-8">
              <p className="text-2xl font-bold text-white mb-2">Mission:</p>
              <p className="text-xl text-gray-300">
                Make saving cool again. Build generational wealth, one locked dollar at a time.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Join Us",
      content: (
        <div className="text-center space-y-12">
          <h2 className="text-6xl md:text-7xl font-bold text-white">Join the Movement</h2>
          <div className="space-y-6 text-xl md:text-2xl text-gray-300">
            <p>{"Financial freedom starts with a single saved dollar."}</p>
            <p className="text-3xl font-bold text-accent">{"Let's build it together."}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center px-10 py-6 text-xl font-bold text-navy bg-accent hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Join Waitlist
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-10 py-6 text-xl font-bold text-white bg-transparent border-2 border-accent hover:bg-accent/10 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
          <div className="pt-12 text-gray-500">
            <p>CashVault - Save. Secure. Grow.</p>
          </div>
        </div>
      ),
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white hover:text-accent transition-colors">
            CashVault
          </Link>
          <div className="text-sm text-gray-400">
            Slide {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </header>

      {/* Main Slide */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">{slides[currentSlide].content}</div>
      </main>

      {/* Navigation */}
      <footer className="border-t border-gray-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="flex items-center gap-2 px-6 py-3 text-white hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-accent w-8" : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="flex items-center gap-2 px-6 py-3 text-white hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentSlide === slides.length - 1}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
