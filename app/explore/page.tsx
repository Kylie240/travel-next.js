import { Suspense } from 'react'
import { getItineraries } from '@/data/itineraries'
import ExploreClient from './explore-client'
import { ItineraryStatus } from '@/types/itineraryStatus'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const filters = {
    destination: searchParams.destination as string,
    duration: searchParams.duration as string,
    budget: searchParams.budget as string,
    continents: Array.isArray(searchParams.continents) ? searchParams.continents : [],
    activityTags: Array.isArray(searchParams.activityTags) ? searchParams.activityTags : [],
    itineraryTags: Array.isArray(searchParams.itineraryTags) ? searchParams.itineraryTags : [],
    countries: Array.isArray(searchParams.countries) ? searchParams.countries : [],
    status: Array.isArray(searchParams.status) 
      ? (searchParams.status as ItineraryStatus[]) 
      : undefined,
    pagination: {
      page: Number(searchParams.page) || 1,
      pageSize: Number(searchParams.pageSize) || 10
    }
  }

  const data = await getItineraries({ filters })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreClient initialData={data} />
    </Suspense>
  )
} 