"use client"

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
    <div className="space-y-4">
      {label && <label className="text-sm font-medium text-foreground block">{label}</label>}
      <div className="flex gap-12 items-end justify-center">
        {ASSETS.map((asset) => {
          const isSelected = value === asset.id
          
          return (
            <div key={asset.id} className="flex flex-col items-center gap-3">
              <div
                onClick={() => onChange(asset.id)}
                className={`relative w-20 h-20 rounded-2xl cursor-pointer transition-all flex items-center justify-center bg-secondary hover:bg-secondary/80 ${
                  isSelected ? "ring-3 ring-primary shadow-lg" : ""
                }`}
              >
                <Image
                  src={asset.logo}
                  alt={asset.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{asset.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
