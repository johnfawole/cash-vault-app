import { Card, CardContent } from "@/components/ui/card"
import { Lock, Target, TrendingUp, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const products = [
  {
    icon: TrendingUp,
    title: "Dollar Cost Averaging",
    tagline: "Invest that's always in policy.",
    description:
      "Buy assets like Bitcoin, Ether, and Stacks at periodic intervals. Make consistent gains through disciplined, automated investing.",
    image: "/bitcoin-ethereum-cryptocurrency-dca-investing-char.jpg",
    imageAlt: "Cryptocurrency investment growth chart",
    link: "/dca",
    comingSoon: false,
  },
  {
    icon: Lock,
    title: "Safe Lock",
    tagline: "Control spend before it happens.",
    description:
      "Lock up your money and foster discipline. Secure your financial future by preventing impulsive spending and building lasting savings habits.",
    image: "/secure-vault-lock-financial-security-safe.jpg",
    imageAlt: "Secure financial vault with lock",
    link: "/safe-lock",
    comingSoon: true,
  },
  {
    icon: Target,
    title: "Targeted Savings",
    tagline: "Save toward what matters.",
    description:
      "Save up towards immigration, education, or your new startup. Set specific goals and watch your dreams become achievable milestones.",
    image: "/savings-goal-target-education-immigration-startup.jpg",
    imageAlt: "Targeted savings goals illustration",
    link: "/targeted-savings",
    comingSoon: true,
  },
]

export function Products() {
  return (
    <section id="products" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">CASHVAULT PRODUCT SUITE</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance max-w-3xl">
            Get to know CashVault
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Replace multiple broken tools with CashVault, the only platform designed to make your finance team
            faster—and happier.
          </p>
        </div>

        <div className="space-y-8 md:space-y-12">
          {products.map((product, index) => {
            const Icon = product.icon
            const isEven = index % 2 === 0

            return (
              <Card
                key={index}
                className={`border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card group ${
                  product.comingSoon ? "opacity-70" : ""
                }`}
              >
                <CardContent className="p-0">
                  <div
                    className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-stretch gap-0`}
                  >
                    <div className={`w-full md:w-1/2 relative h-80 md:h-[500px] bg-secondary ${
                      product.comingSoon ? "blur-sm" : ""
                    }`}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.imageAlt}
                        fill
                        className="object-cover"
                      />
                      {product.comingSoon && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold">
                            Coming Soon
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary border border-border mb-6">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>

                      <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        {product.title}
                      </p>

                      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.tagline}</h3>

                      <p className="text-muted-foreground leading-relaxed text-base mb-8">{product.description}</p>

                      {!product.comingSoon ? (
                        <Link
                          href={product.link}
                          className="inline-flex items-center text-foreground font-medium hover:text-primary transition-colors group-hover:translate-x-1 transform duration-200"
                        >
                          <span className="mr-2">Learn more</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <div className="text-muted-foreground font-medium">Coming Soon</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
