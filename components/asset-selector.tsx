"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

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
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%283%29-MjmgBaPAINPPQ2TyYnDRd9eSTWitXd.png"
  },
  {
    id: "ether",
    name: "Ether",
    description: "ETH",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%284%29-7naQqqpOICY6NxDb5wHnbOe7umEwph.jpg"
  }
]

export function AssetSelector({ value, onChange, label }: AssetSelectorProps) {
  return (
    <div className="space-y-3">
      {label && <label className="text-lg font-semibold text-foreground block">{label}</label>}
      <div className="grid grid-cols-2 gap-4">
        {ASSETS.map((asset) => {
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
                <div className="relative w-12 h-12">
                  <Image
                    src={asset.logo}
                    alt={asset.name}
                    fill
                    className="object-contain"
                  />
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
