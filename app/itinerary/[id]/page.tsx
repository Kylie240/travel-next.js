import { Suspense } from "react"
import Loading from "@/app/loading"
import { itinerary, similarItineraries } from "./data"
import { ItineraryView } from "./itinerary-view"

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ItineraryPage(props: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ItineraryView itinerary={itinerary} similarItineraries={similarItineraries} />
    </Suspense>
  )
} 