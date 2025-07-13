export const itinerary = {
  id: 1,
  title: "Japanese Cultural Journey",
  description:
    "Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun.",
  image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1470&auto=format&fit=crop",
  duration: "14 days",
  countries: ["Japan"],
  cities: ["Tokyo", "Kyoto", "Osaka", "Hakone", "Nara"],
  price: "$3,499",
  rating: 4.8,
  reviews: 24,
  itineraryTags: ["Culture", "Food & Dining", "History", "Urban Exploration", "Nature", "Photography"],
  activityTags: ["Sightseeing", "Food & Dining", "History", "Urban Exploration", "Nature", "Photography"],
  details: "This carefully curated journey takes you through the heart of Japan, blending ancient traditions with modern experiences. You'll explore historic temples, participate in traditional tea ceremonies, and discover the vibrant food scene. The itinerary includes stays in both luxury hotels and authentic ryokans, offering a perfect balance of comfort and cultural immersion. Suitable for first-time visitors to Japan who want to experience the country's highlights while enjoying premium accommodations and expert-guided tours.",
  creator: {
    id: "1",
    name: "Sarah Chen",
    title: "Solo Traveller",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop",
    trips: 12,
    notes: [
      {
        title: "Best Time to Visit",
        content: "Spring (March to May) and Fall (September to November) are ideal for comfortable weather and beautiful scenery. Cherry blossoms bloom in late March to early April, while autumn colors peak in November."
      },
      {
        title: "Transportation Tips",
        content: "Get a JR Pass if you plan to use the bullet train between cities. For local transport, get a prepaid IC card (Pasmo/Suica) for convenient travel on metros and buses."
      },
      {
        title: "Cultural Etiquette",
        content: "Remove shoes before entering homes and some restaurants. Bow when greeting people. Avoid eating while walking or speaking loudly on public transport. Tipping is not customary in Japan."
      },
      {
        title: "Useful Apps",
        content: "Download Google Maps, Google Translate, and Japan Travel by NAVITIME for offline navigation. Many restaurants use mobile payment apps like PayPay."
      }
    ]
  },
  schedule: [
    {
      day: 1,
      title: "Arrival in Tokyo",
      description: "Land at Narita International Airport and transfer to your hotel in Tokyo",
      notes: "This is a test note",
      image: 'https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?w=800&auto=&fit=&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8amFwYW58ZW58MHx8MHx8fDA%3D',
      activities: [
        {
          time: "15:00",
          title: "Hotel Check-in",
          type: "accommodation",
          details: "Check in at the Tokyu Stay Hotel in Shinjuku",
          location: "Shinjuku, Tokyo",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "18:00",
          title: "Welcome Dinner",
          type: "food",
          details: "Traditional Japanese dinner at a local izakaya",
          location: "Shinjuku, Tokyo",
          image: "https://images.unsplash.com/photo-1554502078-ef0fc409efce?q=80&w=1384&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Airport Transfer",
        details: "Private shuttle from Narita Airport to hotel",
      },
    },
    {
      day: 2,
      title: "Tokyo Exploration",
      description: "Discover the highlights of Tokyo's most famous districts",
      notes: "",
      image: '',
      activities: [
        {
          time: "09:00",
          title: "Tsukiji Outer Market",
          type: "sightseeing",
          details: "Explore the famous fish market and try fresh sushi",
          location: "Tsukiji, Tokyo",
          image: "https://images.unsplash.com/photo-1595456982104-14cc660c4d22?q=80&w=1470&auto=format&fit=crop"
        },
        {
          time: "13:00",
          title: "Senso-ji Temple",
          type: "culture",
          details: "Visit Tokyo's oldest Buddhist temple",
          location: "Asakusa, Tokyo",
          image: "https://images.unsplash.com/photo-1583084647979-b53fbbc15e79?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "16:00",
          title: "Harajuku & Meiji Shrine",
          type: "sightseeing",
          details: "Experience modern and traditional Japan side by side",
          location: "Harajuku, Tokyo",
          image: "https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=1374&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Public Transport",
        details: "Tokyo Metro (subway) day pass",
      },
    },
    {
      day: 3,
      title: "Kicking it in Kyoto",
      description: "Discover the highlights of Tokyo's most famous districts",
      notes: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      image: '',
      activities: [
        {
          time: "09:00",
          title: "Tsukiji Outer Market",
          type: "sightseeing",
          details: "Explore the famous fish market and try fresh sushi",
          location: "Tsukiji, Tokyo",
          image: "https://images.unsplash.com/photo-1595456982104-14cc660c4d22?q=80&w=1470&auto=format&fit=crop"
        },
        {
          time: "13:00",
          title: "Senso-ji Temple",
          type: "culture",
          details: "Visit Tokyo's oldest Buddhist temple",
          location: "Asakusa, Tokyo",
          image: "https://images.unsplash.com/photo-1583084647979-b53fbbc15e79?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "16:00",
          title: "Harajuku & Meiji Shrine",
          type: "sightseeing",
          details: "Experience modern and traditional Japan side by side",
          location: "Harajuku, Tokyo",
          image: "https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=1374&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Public Transport",
        details: "Tokyo Metro (subway) day pass",
      },
    },
    {
      day: 4,
      title: "Arrival in Tokyo",
      description: "Land at Narita International Airport and transfer to your hotel in Tokyo",
      notes: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      image: 'https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      activities: [
        {
          time: "15:00",
          title: "Hotel Check-in",
          type: "accommodation",
          details: "Check in at the Tokyu Stay Hotel in Shinjuku",
          location: "Shinjuku, Tokyo",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "18:00",
          title: "Welcome Dinner",
          type: "food",
          details: "Traditional Japanese dinner at a local izakaya",
          location: "Shinjuku, Tokyo",
          image: "https://images.unsplash.com/photo-1554502078-ef0fc409efce?q=80&w=1384&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Airport Transfer",
        details: "Private shuttle from Narita Airport to hotel",
      },
    },
    {
      day: 5,
      title: "Tokyo Exploration",
      description: "Discover the highlights of Tokyo's most famous districts",
      notes: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      image: '',
      activities: [
        {
          time: "09:00",
          title: "Tsukiji Outer Market",
          type: "sightseeing",
          details: "Explore the famous fish market and try fresh sushi",
          location: "Tsukiji, Tokyo",
          image: "https://images.unsplash.com/photo-1595456982104-14cc660c4d22?q=80&w=1470&auto=format&fit=crop"
        },
        {
          time: "13:00",
          title: "Senso-ji Temple",
          type: "culture",
          details: "Visit Tokyo's oldest Buddhist temple",
          location: "Asakusa, Tokyo",
          image: "https://images.unsplash.com/photo-1583084647979-b53fbbc15e79?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "16:00",
          title: "Harajuku & Meiji Shrine",
          type: "sightseeing",
          details: "Experience modern and traditional Japan side by side",
          location: "Harajuku, Tokyo",
          image: "https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=1374&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Public Transport",
        details: "Tokyo Metro (subway) day pass",
      },
    },
  ],
}

export const similarItineraries = [
  {
    id: "2",
    title: "South Korean Adventure",
    destination: "Seoul",
    countries: ["South Korea"],
    imageUrl: "https://images.unsplash.com/photo-1538485399081-7c8272e0fe66?q=80&w=1374&auto=format&fit=crop",
    duration: 10,
    price: 2899,
  },
  {
    id: "3",
    title: "Taiwan Food & Culture",
    destination: "Taipei",
    countries: ["Taiwan"],
    imageUrl: "https://images.unsplash.com/photo-1470004914212-05527e49370b?q=80&w=1374&auto=format&fit=crop",
    duration: 7,
    price: 1999,
  },
  {
    id: "4",
    title: "Vietnam Heritage Tour",
    destination: "Hanoi",
    countries: ["Vietnam"],
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1470&auto=format&fit=crop",
    duration: 12,
    price: 2499,
  },
  {
    id: "5",
    title: "Thailand Island Hopping",
    destination: "Bangkok",
    countries: ["Thailand"],
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1439&auto=format&fit=crop",
    duration: 14,
    price: 2699,
  }
] 