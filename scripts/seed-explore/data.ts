/**
 * Editorial seed content for Explore bootstrapping.
 * Accounts are clearly product/guide personas — not fake private individuals.
 */

export type SeedAccount = {
  key: string
  email: string
  password: string
  name: string
  username: string
  location: string
  bio: string
  avatar: string
}

export type SeedActivity = {
  title: string
  description: string
  time?: string
  type?: number
  location?: string
}

export type SeedDay = {
  title: string
  cityName: string
  countryName: string
  description: string
  activities: SeedActivity[]
}

export type SeedItinerary = {
  /** Stable key for idempotent runs */
  key: string
  accountKey: string
  title: string
  shortDescription: string
  detailedOverview: string
  mainImage: string
  duration: number
  budget: number
  itineraryTags: number[]
  template: "basic" | "discover" | "explore" | "journey" | "wonder"
  days: SeedDay[]
}

const SEED_PASSWORD = "JournliSeed2026!"

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    key: "tokyo-walks",
    email: "tokyo.walks@seed.journli.com",
    password: SEED_PASSWORD,
    name: "Tokyo Walks",
    username: "tokyo.walks",
    location: "Tokyo, Japan",
    bio: "Editorial guide account for Journli. Neighborhood walks, food alleys, and quiet temples.",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=tokyo.walks&backgroundColor=b6e3f4",
  },
  {
    key: "italian-trails",
    email: "italian.trails@seed.journli.com",
    password: SEED_PASSWORD,
    name: "Italian Trails",
    username: "italian.trails",
    location: "Rome, Italy",
    bio: "Editorial guide account for Journli. Classic Italy itineraries with room to wander.",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=italian.trails&backgroundColor=c0aede",
  },
  {
    key: "nordic-escape",
    email: "nordic.escape@seed.journli.com",
    password: SEED_PASSWORD,
    name: "Nordic Escape",
    username: "nordic.escape",
    location: "Reykjavík, Iceland",
    bio: "Editorial guide account for Journli. Nordic cities, coasts, and slow travel days.",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=nordic.escape&backgroundColor=d1d4f9",
  },
  {
    key: "coastal-trips",
    email: "coastal.trips@seed.journli.com",
    password: SEED_PASSWORD,
    name: "Coastal Trips",
    username: "coastal.trips",
    location: "Lisbon, Portugal",
    bio: "Editorial guide account for Journli. Seaside cities, cafés, and sunset viewpoints.",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=coastal.trips&backgroundColor=ffd5dc",
  },
  {
    key: "journli-guides",
    email: "guides@seed.journli.com",
    password: SEED_PASSWORD,
    name: "Journli Guides",
    username: "journli.guides",
    location: "Worldwide",
    bio: "Official editorial guides from Journli. Sample trips to help travelers get started.",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=journli.guides&backgroundColor=ffdfbf",
  },
]

export const SEED_ITINERARIES: SeedItinerary[] = [
  {
    key: "tokyo-3-day-food",
    accountKey: "tokyo-walks",
    title: "3 Days of Tokyo Food Alleys",
    shortDescription: "Ramen counters, market mornings, and neon evenings in Shibuya and Asakusa.",
    detailedOverview:
      "A compact Tokyo plan focused on neighborhoods you can cover on foot and by metro. Mornings are for markets and temples; evenings lean into alley dining and skyline views. Built for first-timers who want flavor without over-scheduling.",
    mainImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
    duration: 3,
    budget: 900,
    itineraryTags: [3, 17, 10],
    template: "discover",
    days: [
      {
        title: "Asakusa mornings & old Tokyo",
        cityName: "Tokyo",
        countryName: "Japan",
        description: "Start east of the neon: temples, street snacks, and the Sumida riverfront.",
        activities: [
          {
            title: "Senso-ji at opening",
            description: "Arrive early for quieter lanes around Nakamise before tour groups peak.",
            time: "08:00",
            type: 4,
            location: "Asakusa",
          },
          {
            title: "Melon pan & coffee walk",
            description: "Grab a warm melon pan nearby, then stroll toward the river.",
            time: "10:00",
            type: 2,
            location: "Nakamise Street",
          },
          {
            title: "Sumida river evening",
            description: "Golden-hour photos from the riverfront, then casual izakaya dinner.",
            time: "17:30",
            type: 2,
            location: "Sumida River",
          },
        ],
      },
      {
        title: "Shibuya & side-street ramen",
        cityName: "Tokyo",
        countryName: "Japan",
        description: "Crossings, department store food halls, and a late noodle run.",
        activities: [
          {
            title: "Shibuya scramble viewpoint",
            description: "Watch the crossing from a higher floor café, then wander backstreets.",
            time: "11:00",
            type: 4,
            location: "Shibuya",
          },
          {
            title: "Depachika lunch",
            description: "Build a picnic from a department basement food hall.",
            time: "13:00",
            type: 2,
            location: "Shibuya",
          },
          {
            title: "Late ramen counter",
            description: "Join a short queue for tonkotsu or shoyu—worth the wait.",
            time: "21:00",
            type: 2,
            location: "Shibuya / Ebisu",
          },
        ],
      },
      {
        title: "TeamLab & quiet neighborhoods",
        cityName: "Tokyo",
        countryName: "Japan",
        description: "One ticketed spectacle, then a slower afternoon in Yanaka or Shimokitazawa.",
        activities: [
          {
            title: "Digital art museum",
            description: "Book timed entry ahead; go early for fewer crowds.",
            time: "10:00",
            type: 3,
            location: "Toyosu / Odaiba area",
          },
          {
            title: "Vintage & coffee stroll",
            description: "Browse small shops and end with a café stop before dinner.",
            time: "15:00",
            type: 8,
            location: "Shimokitazawa",
          },
        ],
      },
    ],
  },
  {
    key: "kyoto-weekend",
    accountKey: "tokyo-walks",
    title: "Kyoto Weekend: Temples & Tea",
    shortDescription: "Two calm days in Kyoto with gardens, Gion lanes, and a tea house pause.",
    detailedOverview:
      "A weekend rhythm for Kyoto: one day for classic temples and Arashiyama edges, one day for Gion and Nishiki. Leave gaps for wandering—Kyoto rewards unscheduled turns.",
    mainImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
    duration: 2,
    budget: 550,
    itineraryTags: [1, 5, 11],
    template: "basic",
    days: [
      {
        title: "Fushimi & southern Kyoto",
        cityName: "Kyoto",
        countryName: "Japan",
        description: "Torii gates early, then a slower afternoon garden.",
        activities: [
          {
            title: "Fushimi Inari early hike",
            description: "Start before 8am if you can—shade and quieter paths higher up.",
            time: "07:30",
            type: 1,
            location: "Fushimi Inari",
          },
          {
            title: "Garden afternoon",
            description: "Pick one temple garden and sit longer than your photos need.",
            time: "14:00",
            type: 15,
            location: "Southern Kyoto",
          },
        ],
      },
      {
        title: "Nishiki & Gion dusk",
        cityName: "Kyoto",
        countryName: "Japan",
        description: "Market snacks by day, lantern streets by evening.",
        activities: [
          {
            title: "Nishiki Market graze",
            description: "Taste as you go—pickles, skewers, and sweet tofu.",
            time: "11:00",
            type: 2,
            location: "Nishiki Market",
          },
          {
            title: "Gion lantern walk",
            description: "Stay respectful of private alleys; sunset light is enough.",
            time: "17:30",
            type: 4,
            location: "Gion",
          },
        ],
      },
    ],
  },
  {
    key: "rome-4-day-classics",
    accountKey: "italian-trails",
    title: "Rome Classics in 4 Days",
    shortDescription: "Ancient sites, trattoria nights, and one slow afternoon in Trastevere.",
    detailedOverview:
      "A first-timer Rome plan that pairs ticketed highlights with neighborhood meals. Book Colosseum and Vatican timed entries ahead. Leave one afternoon unstructured for gelato and wandering.",
    mainImage:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
    duration: 4,
    budget: 1100,
    itineraryTags: [5, 38, 17],
    template: "journey",
    days: [
      {
        title: "Ancient Rome core",
        cityName: "Rome",
        countryName: "Italy",
        description: "Colosseum area by day, Centro Storico dinner.",
        activities: [
          {
            title: "Colosseum & Forum",
            description: "Timed entry; wear good shoes—stone paths are uneven.",
            time: "09:30",
            type: 14,
            location: "Colosseum",
          },
          {
            title: "Trattoria near Campo",
            description: "Simple cacio e pepe or carbonara; avoid menus with photos.",
            time: "19:30",
            type: 2,
            location: "Centro Storico",
          },
        ],
      },
      {
        title: "Vatican morning",
        cityName: "Rome",
        countryName: "Italy",
        description: "Museums early, then a quiet break across the river.",
        activities: [
          {
            title: "Vatican Museums",
            description: "Book the earliest slot you can manage.",
            time: "08:30",
            type: 3,
            location: "Vatican City",
          },
          {
            title: "Castel Sant'Angelo stroll",
            description: "Walk the bridge at golden hour for classic views.",
            time: "17:00",
            type: 4,
            location: "Lungotevere",
          },
        ],
      },
      {
        title: "Trastevere slow day",
        cityName: "Rome",
        countryName: "Italy",
        description: "Markets, ivy lanes, and an aperitivo stop.",
        activities: [
          {
            title: "Morning market",
            description: "Browse produce and street food before the heat builds.",
            time: "10:00",
            type: 2,
            location: "Trastevere",
          },
          {
            title: "Aperitivo hour",
            description: "Spritz and snacks before a late dinner.",
            time: "18:30",
            type: 17,
            location: "Trastevere",
          },
        ],
      },
      {
        title: "Fountains & piazzas",
        cityName: "Rome",
        countryName: "Italy",
        description: "Trevi, Pantheon, and a final gelato lap.",
        activities: [
          {
            title: "Pantheon & piazzas loop",
            description: "Connect Pantheon, Piazza Navona, and Trevi on foot.",
            time: "11:00",
            type: 4,
            location: "Historic Center",
          },
          {
            title: "Final gelato",
            description: "One classic stop—pistachio or stracciatella never fails.",
            time: "16:00",
            type: 2,
            location: "Centro",
          },
        ],
      },
    ],
  },
  {
    key: "amalfi-coast-escape",
    accountKey: "italian-trails",
    title: "Amalfi Coast Long Weekend",
    shortDescription: "Cliff towns, lemon groves, and ferry hops between Positano and Amalfi.",
    detailedOverview:
      "Base in one town and day-trip by ferry or bus. Summers are crowded—shoulder season is kinder. Pack layers for breezy evenings and comfortable shoes for stairs.",
    mainImage:
      "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1600&q=80",
    duration: 3,
    budget: 1400,
    itineraryTags: [7, 8, 1],
    template: "wonder",
    days: [
      {
        title: "Positano arrival",
        cityName: "Positano",
        countryName: "Italy",
        description: "Settle in, beach time, and a cliffside sunset.",
        activities: [
          {
            title: "Beach afternoon",
            description: "Swim or sit with a book; stairs are the workout.",
            time: "14:00",
            type: 1,
            location: "Positano Beach",
          },
          {
            title: "Sunset viewpoint dinner",
            description: "Book a terrace table if you can—views fill fast.",
            time: "19:00",
            type: 2,
            location: "Positano",
          },
        ],
      },
      {
        title: "Ferry to Amalfi",
        cityName: "Amalfi",
        countryName: "Italy",
        description: "Cathedral square, lemon products, and a coastal return.",
        activities: [
          {
            title: "Morning ferry",
            description: "Sit on the open deck for the best coastline views.",
            time: "09:30",
            type: 12,
            location: "Positano → Amalfi",
          },
          {
            title: "Duomo & old town",
            description: "Climb the steps, then wander backstreets for ceramics.",
            time: "11:00",
            type: 4,
            location: "Amalfi",
          },
        ],
      },
      {
        title: "Path of the Gods (or easy hike)",
        cityName: "Positano",
        countryName: "Italy",
        description: "Choose a full hike or a shorter coastal walk based on energy.",
        activities: [
          {
            title: "Coastal hike",
            description: "Start early; bring water and sun protection.",
            time: "08:00",
            type: 1,
            location: "Agerola / Nocelle area",
          },
          {
            title: "Leisurely seafood dinner",
            description: "Celebrate sore legs with simple grilled fish.",
            time: "19:30",
            type: 2,
            location: "Positano",
          },
        ],
      },
    ],
  },
  {
    key: "iceland-ring-lite",
    accountKey: "nordic-escape",
    title: "South Iceland Highlights (5 Days)",
    shortDescription: "Waterfalls, black sand, and Golden Circle classics from Reykjavík.",
    detailedOverview:
      "A south-coast focused plan with Reykjavík as a bookend. Rent a car if comfortable with wind and weather changes. Pack waterproof layers year-round.",
    mainImage:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1600&q=80",
    duration: 5,
    budget: 1800,
    itineraryTags: [24, 32, 30],
    template: "explore",
    days: [
      {
        title: "Reykjavík settle-in",
        cityName: "Reykjavík",
        countryName: "Iceland",
        description: "Harbor walk, hot dogs optional, early night before driving days.",
        activities: [
          {
            title: "Harbor & Hallgrímskirkja",
            description: "Easy orientation walk through downtown.",
            time: "14:00",
            type: 4,
            location: "Reykjavík",
          },
          {
            title: "Geothermal pool evening",
            description: "Local pool culture beats only hitting the big spa brands.",
            time: "19:00",
            type: 6,
            location: "Reykjavík",
          },
        ],
      },
      {
        title: "Golden Circle",
        cityName: "Reykjavík",
        countryName: "Iceland",
        description: "Þingvellir, Geysir, and Gullfoss in one driving day.",
        activities: [
          {
            title: "Þingvellir National Park",
            description: "Walk the rift valley paths; dress for wind.",
            time: "09:30",
            type: 15,
            location: "Þingvellir",
          },
          {
            title: "Geysir & Gullfoss",
            description: "Short stops with big payoffs—keep driving daylight in mind.",
            time: "13:00",
            type: 4,
            location: "Golden Circle",
          },
        ],
      },
      {
        title: "South coast waterfalls",
        cityName: "Vík",
        countryName: "Iceland",
        description: "Seljalandsfoss, Skógafoss, then black sand near Vík.",
        activities: [
          {
            title: "Seljalandsfoss",
            description: "Walk behind the falls if conditions allow—expect spray.",
            time: "10:00",
            type: 1,
            location: "Seljalandsfoss",
          },
          {
            title: "Reynisfjara beach",
            description: "Respect wave warnings; stay far from the waterline.",
            time: "15:30",
            type: 15,
            location: "Reynisfjara",
          },
        ],
      },
      {
        title: "Glacier views & return",
        cityName: "Reykjavík",
        countryName: "Iceland",
        description: "Optional glacier viewpoint, then drive back to the city.",
        activities: [
          {
            title: "Sólheimajökull viewpoint",
            description: "Look, don't walk onto ice without a guide.",
            time: "10:00",
            type: 20,
            location: "Sólheimajökull",
          },
          {
            title: "Reykjavík dinner",
            description: "Seafood or lamb—book ahead on weekends.",
            time: "19:00",
            type: 2,
            location: "Reykjavík",
          },
        ],
      },
      {
        title: "Blue Lagoon or local spa",
        cityName: "Reykjavík",
        countryName: "Iceland",
        description: "Recovery day before flying out.",
        activities: [
          {
            title: "Spa morning",
            description: "Blue Lagoon or a quieter local option depending on budget.",
            time: "10:00",
            type: 6,
            location: "Reykjanes / Reykjavík",
          },
        ],
      },
    ],
  },
  {
    key: "copenhagen-hygge",
    accountKey: "nordic-escape",
    title: "Copenhagen Hygge Weekend",
    shortDescription: "Bikes, bakeries, waterfront walks, and one design museum hour.",
    detailedOverview:
      "A relaxed Copenhagen weekend: Nyhavn photos without lingering too long, Nørrebro coffee, and a long waterfront walk. Rent bikes if weather cooperates.",
    mainImage:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a1a0be?auto=format&fit=crop&w=1600&q=80",
    duration: 2,
    budget: 700,
    itineraryTags: [1, 17, 11],
    template: "basic",
    days: [
      {
        title: "Indre By & waterfront",
        cityName: "Copenhagen",
        countryName: "Denmark",
        description: "Classic center sights with pastry fuel.",
        activities: [
          {
            title: "Bakery breakfast",
            description: "Cardamom bun + coffee before the walking starts.",
            time: "09:00",
            type: 2,
            location: "Indre By",
          },
          {
            title: "Nyhavn to Opera walk",
            description: "Waterfront photos, then keep moving toward quieter quays.",
            time: "11:00",
            type: 4,
            location: "Nyhavn",
          },
        ],
      },
      {
        title: "Nørrebro & parks",
        cityName: "Copenhagen",
        countryName: "Denmark",
        description: "Neighborhood cafés and a green afternoon.",
        activities: [
          {
            title: "Nørrebro café hop",
            description: "Independent coffee shops and vintage browsing.",
            time: "10:30",
            type: 2,
            location: "Nørrebro",
          },
          {
            title: "Park picnic",
            description: "Grab supplies and sit in a park until sunset.",
            time: "15:00",
            type: 1,
            location: "Assistens / nearby parks",
          },
        ],
      },
    ],
  },
  {
    key: "lisbon-3-day",
    accountKey: "coastal-trips",
    title: "Lisbon Hills & Miradouros",
    shortDescription: "Tram views, pasteis, and sunset lookouts across three walkable days.",
    detailedOverview:
      "Lisbon rewards elevation changes—wear shoes with grip. Mix Alfama, Belém, and a day trip option to Sintra if energy allows. Evenings are for miradouro sunsets.",
    mainImage:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
    duration: 3,
    budget: 650,
    itineraryTags: [17, 21, 5],
    template: "discover",
    days: [
      {
        title: "Alfama & castle views",
        cityName: "Lisbon",
        countryName: "Portugal",
        description: "Maze streets, tiles, and a miradouro sunset.",
        activities: [
          {
            title: "Alfama wander",
            description: "Get intentionally a little lost between viewpoints.",
            time: "10:00",
            type: 4,
            location: "Alfama",
          },
          {
            title: "Miradouro sunset",
            description: "Arrive 30 minutes early for a railing spot.",
            time: "18:30",
            type: 4,
            location: "Miradouro da Senhora do Monte",
          },
        ],
      },
      {
        title: "Belém day",
        cityName: "Lisbon",
        countryName: "Portugal",
        description: "Jerónimos, the tower, and the famous pastry line.",
        activities: [
          {
            title: "Pastéis de Belém",
            description: "Go early or late to shorten the queue.",
            time: "09:30",
            type: 2,
            location: "Belém",
          },
          {
            title: "Jerónimos Monastery",
            description: "Check ticket rules; exteriors are stunning even if you skip inside.",
            time: "11:00",
            type: 14,
            location: "Belém",
          },
        ],
      },
      {
        title: "LX Factory & river light",
        cityName: "Lisbon",
        countryName: "Portugal",
        description: "Shops, street art, and a long riverside walk.",
        activities: [
          {
            title: "LX Factory browse",
            description: "Cafés, bookshop, and design stalls.",
            time: "11:00",
            type: 8,
            location: "Alcântara",
          },
          {
            title: "Riverfront evening",
            description: "Walk toward sunset with a drink stop.",
            time: "17:30",
            type: 1,
            location: "Lisbon waterfront",
          },
        ],
      },
    ],
  },
  {
    key: "porto-douro",
    accountKey: "coastal-trips",
    title: "Porto & Douro Tastes",
    shortDescription: "Riverside tiles, port lodges, and a day toward the valley.",
    detailedOverview:
      "Two days in Porto with an optional Douro day. Cross Dom Luís I bridge on foot for the classic view. Save room for francesinha or seafood—your call.",
    mainImage:
      "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=1600&q=80",
    duration: 3,
    budget: 750,
    itineraryTags: [3, 5, 8],
    template: "basic",
    days: [
      {
        title: "Ribeira & Gaia",
        cityName: "Porto",
        countryName: "Portugal",
        description: "Old town tiles and a port tasting across the river.",
        activities: [
          {
            title: "Ribeira walk",
            description: "Morning light on the colorful riverfront.",
            time: "10:00",
            type: 4,
            location: "Ribeira",
          },
          {
            title: "Port lodge tasting",
            description: "Book a short tasting in Vila Nova de Gaia.",
            time: "16:00",
            type: 2,
            location: "Vila Nova de Gaia",
          },
        ],
      },
      {
        title: "Bookstore & viewpoints",
        cityName: "Porto",
        countryName: "Portugal",
        description: "Clérigos area, azulejos, and café time.",
        activities: [
          {
            title: "São Bento station tiles",
            description: "Quick stop for the famous azulejo panels.",
            time: "10:00",
            type: 3,
            location: "São Bento",
          },
          {
            title: "Clérigos tower area",
            description: "Climb if legs allow; otherwise enjoy the surrounding cafés.",
            time: "12:00",
            type: 4,
            location: "Clérigos",
          },
        ],
      },
      {
        title: "Douro day trip",
        cityName: "Pinhão",
        countryName: "Portugal",
        description: "Train or tour into wine country.",
        activities: [
          {
            title: "Valley viewpoints",
            description: "Terraced vines and a leisurely lunch.",
            time: "11:00",
            type: 20,
            location: "Douro Valley",
          },
        ],
      },
    ],
  },
  {
    key: "nyc-weekend",
    accountKey: "journli-guides",
    title: "NYC Weekend Sampler",
    shortDescription: "One museum, two neighborhoods, and a skyline ferry hour.",
    detailedOverview:
      "A realistic weekend in New York: pick one major museum, walk a distinct neighborhood each day, and leave buffer time for the subway. Great template to copy and customize.",
    mainImage:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80",
    duration: 2,
    budget: 800,
    itineraryTags: [17, 11, 26],
    template: "basic",
    days: [
      {
        title: "Downtown & harbor",
        cityName: "New York",
        countryName: "United States",
        description: "Battery Park ferry vibes and a Lower Manhattan walk.",
        activities: [
          {
            title: "Harbor / ferry views",
            description: "Staten Island Ferry (free) or a paid harbor option.",
            time: "10:00",
            type: 4,
            location: "Battery Park",
          },
          {
            title: "SoHo / West Village evening",
            description: "Window shopping and a casual dinner reservation.",
            time: "18:00",
            type: 8,
            location: "Downtown Manhattan",
          },
        ],
      },
      {
        title: "Museum & Uptown stroll",
        cityName: "New York",
        countryName: "United States",
        description: "One museum deep-dive, then Central Park edges.",
        activities: [
          {
            title: "Museum morning",
            description: "MoMA or The Met—don't try both in one day.",
            time: "10:30",
            type: 3,
            location: "Midtown / UES",
          },
          {
            title: "Central Park loop",
            description: "Enter near your museum and walk until legs say stop.",
            time: "14:30",
            type: 1,
            location: "Central Park",
          },
        ],
      },
    ],
  },
  {
    key: "bali-slow-week",
    accountKey: "journli-guides",
    title: "Bali Slow Week: Ubud to Coast",
    shortDescription: "Rice terraces, temple mornings, and a few beach reset days.",
    detailedOverview:
      "Split time between Ubud's calmer pace and a coastal base. Hire drivers for longer transfers. Build in rest—humidity and traffic make ambitious day stacks exhausting.",
    mainImage:
      "https://images.unsplash.com/photo-1537996194471-e66772346ae3?auto=format&fit=crop&w=1600&q=80",
    duration: 6,
    budget: 1200,
    itineraryTags: [7, 1, 2],
    template: "wonder",
    days: [
      {
        title: "Ubud arrival",
        cityName: "Ubud",
        countryName: "Indonesia",
        description: "Settle, gentle walk, early sleep.",
        activities: [
          {
            title: "Campuhan Ridge walk",
            description: "Go late afternoon for cooler air.",
            time: "16:00",
            type: 1,
            location: "Ubud",
          },
        ],
      },
      {
        title: "Temples & terraces",
        cityName: "Ubud",
        countryName: "Indonesia",
        description: "One temple, one terrace viewpoint, one spa hour.",
        activities: [
          {
            title: "Temple morning",
            description: "Wear a sarong; follow local guidance on sacred spaces.",
            time: "09:00",
            type: 18,
            location: "Near Ubud",
          },
          {
            title: "Rice terrace viewpoint",
            description: "Tegallalang or similar—go early for softer light.",
            time: "07:30",
            type: 15,
            location: "Tegallalang",
          },
          {
            title: "Spa reset",
            description: "Book a simple massage; hydration matters.",
            time: "15:00",
            type: 6,
            location: "Ubud",
          },
        ],
      },
      {
        title: "Transfer to the coast",
        cityName: "Canggu",
        countryName: "Indonesia",
        description: "Move base; beach sunset on arrival.",
        activities: [
          {
            title: "Coast transfer",
            description: "Private driver recommended; leave buffer for traffic.",
            time: "10:00",
            type: 12,
            location: "Ubud → Canggu",
          },
          {
            title: "Beach sunset",
            description: "Casual warung dinner nearby.",
            time: "17:30",
            type: 1,
            location: "Canggu",
          },
        ],
      },
      {
        title: "Coast easy day",
        cityName: "Canggu",
        countryName: "Indonesia",
        description: "Surf watch or swim, café work hour optional.",
        activities: [
          {
            title: "Morning beach time",
            description: "Swim where flagged safe; currents vary.",
            time: "09:00",
            type: 1,
            location: "Canggu Beach",
          },
          {
            title: "Café lunch",
            description: "Smoothie bowl tourism is allowed—once.",
            time: "12:30",
            type: 2,
            location: "Canggu",
          },
        ],
      },
      {
        title: "Uluwatu evening",
        cityName: "Uluwatu",
        countryName: "Indonesia",
        description: "Cliff temple and kecak if you want a show.",
        activities: [
          {
            title: "Uluwatu Temple",
            description: "Watch belongings—monkeys are professionals.",
            time: "16:00",
            type: 4,
            location: "Uluwatu",
          },
          {
            title: "Kecak dance (optional)",
            description: "Sunset timing sells out; book ahead.",
            time: "18:00",
            type: 18,
            location: "Uluwatu",
          },
        ],
      },
      {
        title: "Buffer / departure",
        cityName: "Canggu",
        countryName: "Indonesia",
        description: "Shopping, packing, airport buffer.",
        activities: [
          {
            title: "Souvenir morning",
            description: "Coffee, snacks for the flight, and a slow breakfast.",
            time: "09:00",
            type: 8,
            location: "Canggu",
          },
        ],
      },
    ],
  },
  {
    key: "marrakech-long-weekend",
    accountKey: "journli-guides",
    title: "Marrakech Long Weekend",
    shortDescription: "Medina lanes, a garden pause, and rooftop evenings.",
    detailedOverview:
      "Stay in or near the medina for atmosphere, but plan a quieter garden half-day. Hire a guide for your first souk visit if crowds feel overwhelming. Dress respectfully and stay hydrated.",
    mainImage:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=80",
    duration: 3,
    budget: 700,
    itineraryTags: [5, 3, 11],
    template: "explore",
    days: [
      {
        title: "Medina orientation",
        cityName: "Marrakech",
        countryName: "Morocco",
        description: "Jemaa el-Fna edges and a rooftop dinner.",
        activities: [
          {
            title: "Main square dusk",
            description: "Watch the square wake up from a café terrace.",
            time: "17:00",
            type: 4,
            location: "Jemaa el-Fna",
          },
          {
            title: "Rooftop dinner",
            description: "Book ahead on weekends.",
            time: "20:00",
            type: 2,
            location: "Medina",
          },
        ],
      },
      {
        title: "Souks & artisans",
        cityName: "Marrakech",
        countryName: "Morocco",
        description: "Morning shopping with a clear meeting point.",
        activities: [
          {
            title: "Guided souk walk",
            description: "Learn patterns for bargaining; carry small bills.",
            time: "10:00",
            type: 9,
            location: "Souks",
          },
          {
            title: "Riads & courtyards",
            description: "Visit one museum-riad for architecture calm.",
            time: "15:00",
            type: 3,
            location: "Medina",
          },
        ],
      },
      {
        title: "Gardens reset",
        cityName: "Marrakech",
        countryName: "Morocco",
        description: "Jardin Majorelle or a similar green escape.",
        activities: [
          {
            title: "Garden morning",
            description: "Book tickets online for popular gardens.",
            time: "09:30",
            type: 15,
            location: "Majorelle area",
          },
          {
            title: "Hammam or spa",
            description: "Optional recovery before departure.",
            time: "15:00",
            type: 6,
            location: "Marrakech",
          },
        ],
      },
    ],
  },
]
