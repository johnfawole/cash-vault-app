import { Hero } from "@/components/hero"
import { Products } from "@/components/products"
import { About } from "@/components/about"
import { CTASection } from "@/components/cta-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FAQ } from "@/components/faq"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Products />
      <About />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  )
}
