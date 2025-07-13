"use client"

import Link from "next/link"
import { Mountain, Palmtree, Building, Utensils, Camera, Tent, Bike, Ship } from "lucide-react"
import { SearchArea } from "@/components/ui/search-area"
import { ItinerarySection } from "@/components/ui/itinerary-section"
import { BlackBanner } from "@/components/ui/black-banner"
import { useRouter } from "next/navigation"

// Sample data for featured itineraries
const multiCountryItineraries = [
  {
    id: "1",
    title: "Mystical Japan Journey",
    description: "Experience the best of Japan",
    destination: "Japan",
    countries: ["Tokyo", "Kyoto", "Mount Fuji"],
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1470&auto=format&fit=crop",
    duration: 10,
    price: 3499,
    discountedPrice: 2999
  },
  {
    id: "2",
    title: "Greek Islands Explorer",
    description: "Experience the best of Greece",
    destination: "Greece",
    countries: ["Athens", "Santorini", "Mykonos"],
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1374&auto=format&fit=crop",
    duration: 8,
    price: 2799,
    discountedPrice: 2399
  },
  {
    id: "3",
    title: "Machu Picchu & Sacred Valley",
    description: "Experience the best of Peru",
    destination: "Peru",
    countries: ["Lima", "Cusco", "Machu Picchu"],
    imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1470&auto=format&fit=crop",
    duration: 9,
    price: 2799,
    discountedPrice: 2499
  },
  {
    id: "4",
    title: "Vietnam Heritage Trail",
    description: "Experience the best of Vietnam",
    destination: "Vietnam",
    countries: ["Hanoi", "Ha Long Bay", "Hoi An"],
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1470&auto=format&fit=crop",
    duration: 11,
    price: 1999,
    discountedPrice: 1699
  },
  {
    id: "5",
    title: "African Safari Adventure",
    description: "Experience the best of Africa",
    destination: "Tanzania",
    countries: ["Serengeti", "Ngorongoro", "Zanzibar"],
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1468&auto=format&fit=crop",
    duration: 12,
    price: 4999,
    discountedPrice: 4299
  },
  {
    id: "6",
    title: "Iceland Ring Road",
    description: "Experience the best of Iceland",
    destination: "Iceland",
    countries: ["Reykjavik", "Golden Circle", "Vik"],
    imageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1470&auto=format&fit=crop",
    duration: 7,
    price: 3299,
    discountedPrice: 2899
  },
  {
    id: "7",
    title: "Morocco Desert Magic",
    description: "Experience the best of Morocco",
    destination: "Morocco",
    countries: ["Marrakech", "Sahara", "Fes"],
    imageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1470&auto=format&fit=crop",
    duration: 8,
    price: 1899,
    discountedPrice: 1599
  },
  {
    id: "8",
    title: "Turkish Delight",
    description: "Experience the best of Turkey",
    destination: "Turkey",
    countries: ["Istanbul", "Cappadocia", "Pamukkale"],
    imageUrl: "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=1498&auto=format&fit=crop",
    duration: 9,
    price: 2199,
    discountedPrice: 1899
  }
];

const soloTrips = [
  {
    id: "s1",
    title: "Backpacking Southeast Asia",
    description: "Experience the best of Southeast Asia",
    destination: "Thailand",
    countries: ["Bangkok", "Chiang Mai", "Phuket"],
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1400&auto=format&fit=crop",
    duration: 14,
    price: 1899,
    discountedPrice: 1599
  },
  {
    id: "s2",
    title: "New Zealand Adventure",
    description: "Experience the best of New Zealand",
    destination: "New Zealand",
    countries: ["Auckland", "Queenstown", "Wellington"],
    imageUrl: "https://images.unsplash.com/photo-1469521669194-babb45599def?q=80&w=1400&auto=format&fit=crop",
    duration: 10,
    price: 2499,
    discountedPrice: 2199
  },
  {
    id: "s3",
    title: "Portugal Solo Explorer",
    description: "Experience the best of Portugal",
    destination: "Portugal",
    countries: ["Lisbon", "Porto", "Algarve"],
    imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acbe3cf7?q=80&w=1400&auto=format&fit=crop",
    duration: 7,
    price: 1699,
    discountedPrice: 1499
  },
  {
    id: "s4",
    title: "Japan Solo Journey",
    description: "Experience the best of Japan",
    destination: "Japan",
    countries: ["Tokyo", "Osaka", "Kyoto"],
    imageUrl: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?q=80&w=1400&auto=format&fit=crop",
    duration: 12,
    price: 2899,
    discountedPrice: 2599
  }
];

const tropicalVacations = [
  {
    id: "t1",
    title: "Maldives Paradise",
    description: "Experience the best of Maldives",
    destination: "Maldives",
    countries: ["Male", "Maafushi", "Hulhumale"],
    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1400&auto=format&fit=crop",
    duration: 7,
    price: 3499,
    discountedPrice: 2999
  },
  {
    id: "t2",
    title: "Caribbean Island Hopping",
    description: "Experience the best of Caribbean",
    destination: "Caribbean",
    countries: ["Jamaica", "Bahamas", "St. Lucia"],
    imageUrl: "https://images.unsplash.com/photo-1599561046251-bfb9465b4c44?q=80&w=1400&auto=format&fit=crop",
    duration: 10,
    price: 2899,
    discountedPrice: 2499
  },
  {
    id: "t3",
    title: "Bali Beach Retreat",
    description: "Experience the best of Bali",
    destination: "Indonesia",
    countries: ["Seminyak", "Ubud", "Nusa Dua"],
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1400&auto=format&fit=crop",
    duration: 8,
    price: 1899,
    discountedPrice: 1599
  },
  {
    id: "t4",
    title: "Seychelles Luxury",
    description: "Experience the best of Seychelles",
    destination: "Seychelles",
    countries: ["Mahé", "Praslin", "La Digue"],
    imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1400&auto=format&fit=crop",
    duration: 9,
    price: 4299,
    discountedPrice: 3799
  }
];

const popularListings = [
  {
    id: "p1",
    title: "Paris & French Riviera",
    description: "Experience the best of Paris and the French Riviera",
    destination: "France",
    countries: ["Paris", "Nice", "Cannes"],
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop",
    duration: 8,
    price: 2799,
    discountedPrice: 2399
  },
  {
    id: "p2",
    title: "Italian Classics",
    description: "Experience the best of Italy",
    destination: "Italy",
    countries: ["Rome", "Florence", "Venice"],
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1400&auto=format&fit=crop",
    duration: 9,
    price: 2599,
    discountedPrice: 2299
  },
  {
    id: "p3",
    title: "Swiss Alps Explorer",
    description: "Experience the best of Switzerland",
    destination: "Switzerland",
    countries: ["Zurich", "Lucerne", "Interlaken"],
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1400&auto=format&fit=crop",
    duration: 7,
    price: 3199,
    discountedPrice: 2799
  },
  {
    id: "p4",
    title: "Spain Highlights",
    description: "Experience the best of Spain",
    destination: "Spain",
    countries: ["Barcelona", "Madrid", "Seville"],
    imageUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1400&auto=format&fit=crop",
    duration: 10,
    price: 2399,
    discountedPrice: 1999
  }
];

const mostViewed = [
  {
    id: "m1",
    title: "Dubai Luxury & Desert",
    description: "Experience the best of Dubai and the UAE",
    destination: "UAE",
    countries: ["Dubai", "Abu Dhabi"],
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400&auto=format&fit=crop",
    duration: 6,
    price: 2999,
    discountedPrice: 2599
  },
  {
    id: "m2",
    title: "Egypt Pyramids & Nile",
    description: "Explore the pyramids of Egypt and the Nile River",
    destination: "Egypt",
    countries: ["Cairo", "Luxor", "Aswan"],
    imageUrl: "https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=1400&auto=format&fit=crop",
    duration: 8,
    price: 2199,
    discountedPrice: 1899
  },
  {
    id: "m3",
    title: "Costa Rica Adventure",
    description: "Experience the best of Costa Rica",
    destination: "Costa Rica",
    countries: ["San Jose", "Arenal", "Manuel Antonio"],
    imageUrl: "https://images.unsplash.com/photo-1518181835702-6eef8b4b2113?q=80&w=1400&auto=format&fit=crop",
    duration: 9,
    price: 2399,
    discountedPrice: 1999
  },
  {
    id: "m4",
    title: "Australian Outback",
    description: "Experience the best of Australia",
    destination: "Australia",
    countries: ["Sydney", "Uluru", "Cairns"],
    imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=1400&auto=format&fit=crop",
    duration: 12,
    price: 3899,
    discountedPrice: 3399
  }
];

const popularCountries = [
  {
    id: "c1",
    name: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1400&auto=format&fit=crop",
    tripCount: 48
  },
  {
    id: "c2",
    name: "Italy",
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1400&auto=format&fit=crop",
    tripCount: 56
  },
  {
    id: "c3",
    name: "France",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop",
    tripCount: 42
  },
  {
    id: "c4",
    name: "Thailand",
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1400&auto=format&fit=crop",
    tripCount: 35
  },
  {
    id: "c5",
    name: "Spain",
    imageUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1400&auto=format&fit=crop",
    tripCount: 39
  },
  {
    id: "c6",
    name: "Greece",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1400&auto=format&fit=crop",
    tripCount: 44
  },
  {
    id: "c7",
    name: "Australia",
    imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=1400&auto=format&fit=crop",
    tripCount: 31
  },
  {
    id: "c8",
    name: "Switzerland",
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1400&auto=format&fit=crop",
    tripCount: 28
  }
];

const travelCategories = [
  {
    id: "cat1",
    name: "Adventure",
    description: "Thrilling outdoor activities and extreme sports",
    icon: Mountain,
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop",
    tripCount: 86
  },
  {
    id: "cat2",
    name: "Beach",
    description: "Relaxing coastal getaways and island hopping",
    icon: Palmtree,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop",
    tripCount: 94
  },
  {
    id: "cat3",
    name: "Cultural",
    description: "Historical sites and local traditions",
    icon: Building,
    imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1400&auto=format&fit=crop",
    tripCount: 78
  },
  {
    id: "cat4",
    name: "Culinary",
    description: "Food tours and cooking experiences",
    icon: Utensils,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1400&auto=format&fit=crop",
    tripCount: 52
  },
  {
    id: "cat5",
    name: "Photography",
    description: "Picture-perfect locations and photo tours",
    icon: Camera,
    imageUrl: "https://images.unsplash.com/photo-1452802447250-470a88ac82bc?q=80&w=1400&auto=format&fit=crop",
    tripCount: 45
  },
  {
    id: "cat6",
    name: "Camping",
    description: "Wilderness experiences and glamping",
    icon: Tent,
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1400&auto=format&fit=crop",
    tripCount: 63
  },
  {
    id: "cat7",
    name: "Cycling",
    description: "Bike tours and mountain trails",
    icon: Bike,
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1400&auto=format&fit=crop",
    tripCount: 41
  },
  {
    id: "cat8",
    name: "Cruise",
    description: "Ocean voyages and river expeditions",
    icon: Ship,
    imageUrl: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1400&auto=format&fit=crop",
    tripCount: 37
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

interface CountryCardProps {
  name: string;
  imageUrl: string;
  tripCount: number;
  onClick?: () => void;
}

const CountryCard = ({ name, imageUrl, tripCount, onClick }: CountryCardProps) => {
  const router = useRouter();
  return (
    <button 
      onClick={() => {
        router.push(`/explore?destination=${name}`);
      }}
      className="relative rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 w-full group overflow-hidden"
      style={{ aspectRatio: '2/1' }}
    >
      {/* Background image that only shows on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <span className="text-xl font-medium text-gray-900 group-hover:text-white mb-3">{name}</span>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700 group-hover:bg-white/20 group-hover:text-white transition-colors">
          {tripCount} Trips
        </span>
      </div>
    </button>
  );
};

interface CategoryCardProps {
  name: string;
  icon: any;
  imageUrl: string;
  onClick?: () => void;
}

const CategoryCard = ({ name, icon: Icon, imageUrl, onClick }: CategoryCardProps) => {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.push(`/explore?category=${name.toLowerCase()}`)}
      className="relative flex items-center gap-3 p-6 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 w-full group overflow-hidden"
      style={{ aspectRatio: '2/1' }}
    >
      {/* Background image that only shows on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      </div>

      {/* Icon and text content */}
      <div className="relative z-10 flex items-center justify-center gap-3 w-full">
        <div className="bg-gray-100 rounded-full p-3 group-hover:bg-white/20">
          <Icon className="w-5 h-5 text-gray-700 group-hover:text-white" />
        </div>
        <span className="text-gray-900 font-medium group-hover:text-white">{name}</span>
      </div>
    </button>
  );
};

export default function Home() {
  const router = useRouter()

  const onEditProfile = () => {
    router.push("/profile")
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative max-w-screen md:max-w-none min-h-[700px] md:min-h-[600px] flex items-center mb-32 md:mb-16 justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 inset-y-0 rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://th.bing.com/th/id/R.666511722b8a59564f5c16637d138956?rik=VQ39yQHssfwsNA&pid=ImgRaw&r=0https://th.bing.com/th/id/R.666511722b8a59564f5c16637d138956?rik=VQ39yQHssfwsNA&pid=ImgRaw&r=0')`,
            }}>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-[10] max-w-6xl w-full px-12 md:px-[4rem] lg:px-[4.4rem] xl:px-0 pb-48 md:pb-0">
          <h1 className="md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white mb-6 text-4xl">
            DISCOVER YOUR NEXT ADVENTURE
          </h1>
          <p className="text-xl text-white mb-12 leading-relaxed text-left mx-auto">
            Find travel experiences crafted by fellow explorers.
          </p>
          <div className="flex gap-4">
            <Link href="/explore">
              <button className="hover:bg-gray-700 rounded-lg p-4 text-md transition-colors bg-[#000000] text-[#ffffff]">
                Explore All Itineraries
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-[-140px] sm:px-12 lg:px-8 md:bottom-[-60px] z-64 left-0 w-full md:px-16 lg:px-8">
          <SearchArea />
        </div>
      </section>

      {/* Popular Listings */}
      <section className="py-16 bg-white">
        <ItinerarySection
          type="popular"
          title="Popular Listings"
          description="Discover our most booked destinations and experiences."
          itineraries={popularListings}
        />
      </section>

      {/* Travel Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8">
            <p className="text-gray-600 text-2xl">
              Find the perfect trip that matches your interests
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {travelCategories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                imageUrl={category.imageUrl}
                onClick={() => console.log(`Clicked ${category.name}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Black Banner */}
      <BlackBanner 
        subtitle="Create and save your own itineraries"
        title="In-house tech that guarantees unbeatable prices"
        description="SmartFare secures the lowest fares on flights & local services, guaranteeing you the best price."
      />

      {/* Most Viewed */}
      <section className="py-16 bg-gray-50">
        <ItinerarySection
          type="most-viewed"
          title="Most Viewed"
          description="See what other travelers are exploring right now."
          itineraries={mostViewed}
        />
      </section>

      {/* Popular Countries */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h2 className="text-3xl font-semibold mb-4">Choose your next adventure's destination</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCountries.map((country) => (
              <CountryCard
                key={country.id}
                name={country.name}
                imageUrl={country.imageUrl}
                tripCount={country.tripCount}
                onClick={() => console.log(`Clicked ${country.name}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Multi-country Itineraries */}
      <section className="py-16 bg-gray-50">
        <ItinerarySection
          type="multi-country"
          title="Multi-country itineraries"
          description="Explore our multi-country tours! Let yourself be surprised by our extended version top sellers."
          itineraries={multiCountryItineraries}
        />
      </section>

      {/* Solo Trips */}
      <section className="py-16 bg-white">
        <ItinerarySection
          type="solo"
          title="Solo Trips"
          description="Perfect itineraries for independent travelers seeking adventure and self-discovery."
          itineraries={soloTrips}
        />
      </section>

      {/* Black Banner */}
      <BlackBanner 
        subtitle="Start earning today"
        title="Join our community of travelers"
        description="Sign up to earn money by sharing your travel experiences."
      />

      {/* Tropical Vacations */}
      <section className="py-16 bg-gray-50">
        <ItinerarySection
          type="tropical"
          title="Tropical Vacations"
          description="Escape to paradise with our handpicked selection of tropical getaways."
          itineraries={tropicalVacations}
        />
      </section>
    </div>
  );
}
