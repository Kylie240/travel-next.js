"use client"

import { MapPin } from "lucide-react"
import { AuthDialog } from "./auth-dialog"

interface BlackBannerProps {
  icon?: React.ReactNode
  subtitle: string
  title: string
  description: string
}

export function BlackBanner({ icon = <MapPin className="w-4 h-4" />, subtitle, title, description }: BlackBannerProps) {
  return (
    <section className="py-16 bg-black">
      <div className="container text-white text-center">
        <span className="flex justify-center items-center gap-2 mb-8 text-lg text-white">
          {icon}
          {subtitle}
        </span>
        <h2 className="text-5xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-xl font-light pb-8">{description}</p>
        <AuthDialog />
      </div>
    </section>
  )
} 