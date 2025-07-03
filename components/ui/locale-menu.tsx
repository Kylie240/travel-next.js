"use client"

import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Globe, Check } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
]

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
]

export function LocaleMenu() {
  const [selectedLanguage, setSelectedLanguage] = React.useState("en")
  const [selectedCurrency, setSelectedCurrency] = React.useState("USD")

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-700 hover:text-black hover:bg-gray-100"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-[240px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]"
          align="end"
          sideOffset={5}
        >
          {/* Language Section */}
          <div className="px-2 pb-2">
            <div className="text-sm font-medium text-gray-500 px-2 pb-2">
              Language
            </div>
            {languages.map((lang) => (
              <DropdownMenu.Item
                key={lang.code}
                className={cn(
                  "text-sm px-2 py-1.5 rounded-md cursor-pointer outline-none flex items-center justify-between",
                  selectedLanguage === lang.code
                    ? "bg-travel-50 text-travel-900"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSelectedLanguage(lang.code)}
              >
                {lang.name}
                {selectedLanguage === lang.code && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenu.Item>
            ))}
          </div>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />

          {/* Currency Section */}
          <div className="px-2">
            <div className="text-sm font-medium text-gray-500 px-2 pb-2">
              Currency
            </div>
            {currencies.map((currency) => (
              <DropdownMenu.Item
                key={currency.code}
                className={cn(
                  "text-sm px-2 py-1.5 rounded-md cursor-pointer outline-none flex items-center justify-between",
                  selectedCurrency === currency.code
                    ? "bg-travel-50 text-travel-900"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSelectedCurrency(currency.code)}
              >
                <span>{currency.name}</span>
                <span className="flex items-center gap-1">
                  <span className="text-gray-500">{currency.symbol}</span>
                  {selectedCurrency === currency.code && (
                    <Check className="h-4 w-4" />
                  )}
                </span>
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
} 