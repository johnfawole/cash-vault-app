import { Lock, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-8">
          {/* Left: CashVault branding */}
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <div>
              <span className="text-sm font-semibold text-foreground">CashVault</span>
              <p className="text-xs text-muted-foreground">Plan, save, and secure your financial future.</p>
            </div>
          </div>

          {/* Middle/Right: Twitter and Copyright */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/0xcashvault"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <p className="text-xs text-muted-foreground whitespace-nowrap">© 2025 CashVault. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
