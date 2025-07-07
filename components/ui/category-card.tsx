import { LucideIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  name: string
  icon: LucideIcon
  imageUrl?: string
  onClick?: () => void
  className?: string
  selected?: boolean
}

export function CategoryCard({ 
  name, 
  icon: Icon, 
  imageUrl, 
  onClick, 
  className = "",
  selected = false
}: CategoryCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg cursor-pointer transition-all",
        selected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {imageUrl ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
          <Image
            src={imageUrl}
            alt={name}
            width={400}
            height={300}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center gap-2 text-white">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{name}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 h-full group-hover:bg-muted/70 transition-colors">
          <Icon className="h-8 w-8 mb-2 text-foreground/80 group-hover:text-primary transition-colors" />
          <span className="font-medium text-center">{name}</span>
        </div>
      )}
    </div>
  )
} 