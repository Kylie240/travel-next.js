"use client"

import { deleteItinerary } from "@/lib/actions/itinerary.actions"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Trash2 } from 'lucide-react'
import React from 'react'
import { toast } from "sonner"

const DeleteButton = ({ itineraryId }: { itineraryId: string }) => {
  return (
    <DropdownMenu.Item
        className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
        onClick={async (event) => {
            event.stopPropagation()
            if (confirm('Are you sure you want to delete this itinerary?')) {
                try {
                    await deleteItinerary(itineraryId)
                    toast.success('Itinerary deleted successfully')
                    window.location.reload()
                } catch (error) {
                    toast.error('Failed to delete itinerary')
                }
            }
        }}
    >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
    </DropdownMenu.Item>
  )
}

export default DeleteButton