import { cn } from "@/lib/utils"
import { Button } from "./button"

interface QuickFilterListProps {
  filters: string[]
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

export function QuickFilterList({
  filters,
  selectedFilter,
  onFilterChange,
}: QuickFilterListProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {filters.map((filter) => (
        <Button
          key={filter}
          variant="outline"
          size="sm"
          className={cn(
            "whitespace-nowrap",
            selectedFilter === filter
              ? "bg-travel-900 text-white hover:bg-travel-800"
              : "hover:bg-gray-100"
          )}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  )
} 