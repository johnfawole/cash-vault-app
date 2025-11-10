"use client"

import { Plus, Minus } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "Is CashVault all about savings?",
    answer: "Yes, it is essentially built to help you plan, save, and grow your finances.",
  },
  {
    question: "Can saving money really make me rich?",
    answer:
      "Yes, it can. Imagine you were buying $200 worth of Bitcoin weekly from 2010 to 2015 — that would have been around $260k!",
  },
  {
    question: "What if I want to invest?",
    answer:
      "As you save for a long period, you implicitly make returns from the market — even when you don't actively trade.",
  },
  {
    question: "Will CashVault be available for institutions and protocols?",
    answer:
      "In the future, we plan to support institutions more, and also create an API to embed our product into other protocols.",
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
      >
        <span className="text-xl md:text-2xl font-semibold text-white pr-8">{question}</span>
        <span className="flex-shrink-0 text-accent">{isOpen ? <Minus size={28} /> : <Plus size={28} />}</span>
      </button>
      {isOpen && (
        <div className="pb-6 text-lg md:text-xl text-white/70 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          {answer}
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 text-balance">
          Frequently asked questions
        </h2>
        <p className="text-xl md:text-2xl text-white/60 mb-16">Everything you need to know about CashVault</p>
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
