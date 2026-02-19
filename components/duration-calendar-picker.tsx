"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface DurationCalendarPickerProps {
  value: string
  onChange: (duration: string) => void
  label?: string
}

const MONTHS = [
  { num: 1, name: "January" },
  { num: 2, name: "February" },
  { num: 3, name: "March" },
  { num: 4, name: "April" },
  { num: 5, name: "May" },
  { num: 6, name: "June" },
  { num: 7, name: "July" },
  { num: 8, name: "August" },
  { num: 9, name: "September" },
  { num: 10, name: "October" },
  { num: 11, name: "November" },
  { num: 12, name: "December" }
]

export function DurationCalendarPicker({ value, onChange, label }: DurationCalendarPickerProps) {
  return (
    <div className="space-y-3">
      {label && <label className="text-lg font-semibold text-foreground block">{label}</label>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {MONTHS.map((month) => {
          const isSelected = value === month.num.toString()
          
          return (
            <Card
              key={month.num}
              onClick={() => onChange(month.num.toString())}
              className={`p-4 cursor-pointer transition-all border-2 text-center ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <p className="text-2xl font-bold text-primary">{month.num}</p>
                <p className="text-xs font-medium text-foreground">{month.name.slice(0, 3)}</p>
              </div>
            </Card>
          )
        })}
      </div>
      {value && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-foreground">
            Selected: <span className="font-semibold">{MONTHS.find(m => m.num.toString() === value)?.name}</span> ({value} month{value !== "1" ? "s" : ""})
          </p>
        </div>
      )}
    </div>
  )
}
