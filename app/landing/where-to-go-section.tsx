import Image from "next/image"
import Link from "next/link"

export type DestinationSpot = {
  name: string
  imageUrl: string
  tripCount: number
  href: string
}

export function WhereToGoSection({
  destinations,
}: {
  destinations: DestinationSpot[]
}) {
  if (!destinations.length) return null

  return (
    <section className="py-14 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Select A Destination
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href={destination.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative bg-black h-14 w-full sm:h-16 md:h-14 overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-[1.03]">
                {/* <Image
                  src={destination.imageUrl}
                  alt={destination.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                /> */}
                {/* <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" /> */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-base font-semibold text-white px-4">
                    {destination.name}
                  </p>
                </div>
              </div>
              {/* <p className="text-sm text-gray-500">
                {destination.tripCount > 0
                  ? `${destination.tripCount} ${
                      destination.tripCount === 1 ? "trip" : "trips"
                    }`
                  : "Explore"}
              </p> */}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
