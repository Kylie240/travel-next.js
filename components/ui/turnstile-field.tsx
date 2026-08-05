"use client"

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useRef } from "react"

type TurnstileFieldProps = {
  onToken: (token: string) => void
  onExpire?: () => void
  className?: string
}

export function TurnstileField({
  onToken,
  onExpire,
  className,
}: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  const ref = useRef<TurnstileInstance | null>(null)

  if (!siteKey) {
    return null
  }

  return (
    <div className={className}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.()
          ref.current?.reset()
        }}
        onError={() => {
          onExpire?.()
        }}
        options={{
          theme: "light",
          size: "flexible",
        }}
      />
    </div>
  )
}

export function isClientTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim())
}
