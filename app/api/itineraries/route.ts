import { NextResponse } from 'next/server'
import { getItineraries } from '@/data/itineraries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      destination: searchParams.get('destination') || undefined,
      duration: searchParams.get('duration') || undefined,
      budget: searchParams.get('budget') || undefined,
      continents: searchParams.getAll('continents') || undefined,
      activityTags: searchParams.getAll('activityTags') || undefined,
      itineraryTags: searchParams.getAll('itineraryTags') || undefined,
      countries: searchParams.getAll('countries') || undefined,
      status: searchParams.getAll('status') as any[] || undefined,
      pagination: {
        page: Number(searchParams.get('page')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 10
      }
    }

    const data = await getItineraries({ filters })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching itineraries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    )
  }
} 