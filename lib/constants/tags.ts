import { Mountain, Utensils, Building, Palmtree, Camera, Ship, Wine, Heart, Music, TentTree, Palette, ShoppingBag, Dumbbell, Drama, Trees, BaggageClaim, Car, Presentation, HandPlatter, Caravan, Coins, HeartHandshake, RollerCoaster, Handshake, HandHeart, ChefHat, Briefcase, Backpack, BookMarked, Church, Skull, Sprout, Sailboat, CalendarFold, Syringe, Sparkles, HotelIcon } from "lucide-react"
import { FaCity, FaHandSparkles, FaPeopleGroup, FaPersonWalkingLuggage, FaWheelchair, FaWheelchairMove } from "react-icons/fa6";
import { PiFarm } from "react-icons/pi";
import { BiSpa } from "react-icons/bi";
import { LuAmphora, LuBinoculars, LuBriefcaseMedical, LuCookingPot, LuTicketsPlane } from "react-icons/lu";
import { MdOutlineNightlife, MdOutlineNordicWalking } from "react-icons/md";
import { TbHeartHandshake, TbYoga } from "react-icons/tb";

export const activityTagsMap = [
  { id:1, name: "Outdoor", icon: TentTree },
  { id:2, name: "Dining", icon: Utensils },
  { id:3, name: "Art & Culture", icon: Palette },
  { id:4, name: "Sightseeing", icon: Camera },
  { id:5, name: "Nautical", icon: Sailboat },
  { id:6, name: "Wellness", icon: BiSpa },
  { id:7, name: "Beauty", icon: Heart },
  { id:8, name: "Shopping", icon: ShoppingBag },
  { id:9, name: "Tour", icon: LuBinoculars },
  { id:10, name: "Class", icon: Presentation },
  { id:11, name: "Cooking", icon: LuCookingPot },
  { id:12, name: "Transportation", icon: Car },
  { id:13, name: "Travel", icon: BaggageClaim },
  { id:14, name: "History", icon: LuAmphora },
  { id:15, name: "Nature", icon: Trees },
  { id:16, name: "Music", icon: Music },
  { id:17, name: "Nightlife", icon: MdOutlineNightlife },
  { id:18, name: "Performance", icon: Drama },
  { id:19, name: "Workout", icon: Dumbbell },
  { id:20, name: "Accommodation", icon: HotelIcon },
]

export const itineraryTagsMap = [
  { id:1, name :"Relaxing", icon: Sparkles }, 
  { id:2, name :"Wellness", icon: TbYoga },
  { id:3, name :"Culinary", icon: ChefHat }, 
  { id:4, name :"Business", icon: Briefcase }, 
  { id:5, name :"Cultural", icon: Building }, 
  { id:6, name :"Backpacking", icon: Backpack }, 
  { id:7, name :"Tropical", icon: Palmtree }, 
  { id:8, name :"Romantic", icon: Wine }, 
  { id:9, name :"Digital Nomad", icon: Camera }, 
  { id:10, name :"Solo", icon: FaPersonWalkingLuggage }, 
  { id:11, name :"Weekend Trip", icon: CalendarFold }, 
  { id:12, name :"Cruise", icon: Ship }, 
  { id:13, name :"Sustainable", icon: Sprout }, 
  { id:14, name :"Medical", icon: Syringe }, 
  { id:15, name :"Educational", icon: BookMarked }, 
  { id:16, name :"Rural", icon: PiFarm }, 
  { id:17, name :"Urban", icon: FaCity }, 
  { id:18, name :"Spiritual", icon: Church }, 
  { id:19, name :"Dark Tourism", icon: Skull }, 
  { id:20, name :"Luxury", icon: HandPlatter }, 
  { id:21, name :"Budget", icon: Coins }, 
  { id:22, name :"Road Trip", icon: Caravan }, 
  { id:23, name :"Volunteering", icon: Handshake }, 
  { id:24, name :"Adventure", icon: RollerCoaster }, 
  { id:25, name :"Multi-Country", icon: LuTicketsPlane }, 
  { id:26, name :"Action Packed", icon: Music }, 
  { id:27, name :"Family Oriented", icon: FaPeopleGroup },
  { id:28, name :"LGBTQ+", icon: TbHeartHandshake },
  { id:29, name :"Accessible", icon: FaWheelchairMove },
  { id:30, name :"Off The Grid", icon: MdOutlineNordicWalking },
  { id:30, name :"Camping", icon: TentTree },
  ]

  export const travelerTypesMap = [
    { id: 1, label: "Budget Traveler", description: "Loves finding the best experiences while spending as little as possible." },
    { id: 2, label: "Luxury Seeker", description: "Prefers comfort, premium stays, and exclusive experiences." },
    { id: 3, label: "Mid-Range Explorer", description: "Balances comfort and cost with practical, enjoyable travel." },
    { id: 4, label: "Backpacker", description: "Travels light, seeks adventure, and values freedom over luxury." },
    { id: 5, label: "Solo Enthusiast", description: "Enjoys traveling independently and embracing personal discovery." },
    { id: 6, label: "Couples Traveler", description: "Explores the world with a partner, seeking romantic getaways and shared experiences." },
    { id: 7, label: "Family Adventurer", description: "Plans trips around family-friendly activities and destinations." },
    { id: 8, label: "Group Traveler", description: "Loves sharing experiences with friends or larger groups." },
    { id: 9, label: "Adventure Junkie", description: "Chases adrenaline and thrilling outdoor experiences." },
    { id: 10, label: "Cultural Explorer", description: "Seeks history, traditions, art, and deep cultural immersion." },
    { id: 11, label: "Wellness Seeker", description: "Travels to recharge through retreats, spas, or mindful experiences." },
    { id: 12, label: "Digital Nomad", description: "Blends work and travel, always looking for WiFi and new experiences." },
    { id: 13, label: "Festival Chaser", description: "Follows global events, music festivals, and celebrations." },
    { id: 14, label: "Foodie", description: "Travels for flavors, local cuisines, and culinary adventures." },
    { id: 15, label: "Eco-Traveler", description: "Focuses on sustainability and eco-friendly travel choices." },
    { id: 16, label: "Nature Lover", description: "Seeks hiking, wildlife, and breathtaking landscapes." },
    { id: 17, label: "City Explorer", description: "Enjoys urban vibes, architecture, nightlife, and culture." },
    { id: 18, label: "Slow Traveler", description: "Takes time to deeply experience each destination." },
    { id: 19, label: "Pathfinder", description: "Explores hidden gems and less-traveled routes." },
    { id: 20, label: "Dreamcatcher", description: "Follows bucket-list adventures and once-in-a-lifetime trips." },
    { id: 21, label: "Connector", description: "Travels for people, communities, and meaningful connections." },
    { id: 22, label: "Wanderlux", description: "Mixes adventure with luxury, enjoying the best of both worlds." }
  ]

export const sortOptions = [
  { value: "most-recent", label: "Most Recent" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "best-rated", label: "Best Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "duration-short", label: "Duration: Shortest" },
  { value: "duration-long", label: "Duration: Longest" },
]

export const quickFilters = [
  "All",
  "Popular",
  "Most Viewed",
  "Best Rated",
  "New",
  "Trending",
  "Budget Friendly",
  "Luxury"
] 