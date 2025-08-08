"use client"

import { Bookmark } from "lucide-react"

interface BookmarkButtonProps {
  className?: string;
}

export function BookmarkButton({ className }: BookmarkButtonProps) {
  return (
    <button className={`bg-white/40 text-black hover:bg-white/80 px-2 py-2 rounded-full ${className || ''}`}>
      <Bookmark className="h-5 w-5" />
    </button>
  );
} 