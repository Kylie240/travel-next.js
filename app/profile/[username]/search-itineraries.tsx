"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchItinerariesProps {
  itineraryData: any[]
  onSearch: (filteredData: any[]) => void
}

export default function SearchItineraries({ itineraryData, onSearch }: SearchItinerariesProps) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (text: string) => {
    setSearchValue(text)
    if (text === '') {
      onSearch(itineraryData)
      return
    }
    const filtered = itineraryData.filter(item =>
      item.title.toLowerCase().includes(text.toLowerCase())
    )
    onSearch(filtered)
  }

  return (
    <div className="mb-8 relative max-w-[550px]">
      <Input
        type="text"
        placeholder={`Search all ${itineraryData?.length} itineraries`}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 font-medium rounded-xl bg-gray-100 border-none"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  )
}
