"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, Zap } from "lucide-react"

interface AssetSelectorProps {
  value: string
  onChange: (asset: string) => void
  label?: string
}

const ASSETS = [
  {
    id: "usdc",
    name: "USDC",
    description: "USD Coin",
    icon: DollarSign,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "ether",
    name: "Ether",
    description: "ETH",
    icon: Zap,
    color: "bg-purple-100 text-purple-600"
  }
]

export function AssetSelector({ value, onChange, label }: AssetSelectorProps) {
  return (
    <div className="space-y-3">
      {label && <label className="text-lg font-semibold text-foreground block">{label}</label>}
      <div className="grid grid-cols-2 gap-4">
        {ASSETS.map((asset) => {
          const Icon = asset.icon
          const isSelected = value === asset.id
          
          return (
            <Card
              key={asset.id}
              onClick={() => onChange(asset.id)}
              className={`p-6 cursor-pointer transition-all border-2 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-lg ${asset.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
