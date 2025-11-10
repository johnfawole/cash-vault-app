import { Lock, Twitter, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Lock className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">CashVault</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building the foundation for your financial success through disciplined saving and smart investing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Products</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/safe-lock"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Safe Lock
                </Link>
              </li>
              <li>
                <Link
                  href="/targeted-savings"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Targeted Savings
                </Link>
              </li>
              <li>
                <Link href="/dca" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  DCA Investing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 CashVault. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
