import { Mountain, Utensils, Building, Palmtree, Camera, Ship, Wine, Heart, Music, TentTree, Palette, ShoppingBag, Dumbbell, Drama, Trees, BaggageClaim, Car, Presentation, HandPlatter, Caravan, Coins, HeartHandshake, RollerCoaster, Handshake, HandHeart, ChefHat, Briefcase, Backpack, BookMarked, Church, Skull, Sprout, Sailboat, CalendarFold, Syringe, Sparkles } from "lucide-react"
import { FaCity, FaHandSparkles, FaPersonWalkingLuggage } from "react-icons/fa6";
import { PiFarm } from "react-icons/pi";
import { BiSpa } from "react-icons/bi";
import { LuAmphora, LuBinoculars, LuBriefcaseMedical, LuCookingPot, LuTicketsPlane } from "react-icons/lu";
import { MdOutlineNightlife } from "react-icons/md";
import { TbYoga } from "react-icons/tb";

export const activityTags = [
  { name: "outdoor", icon: TentTree },
  { name: "dining", icon: Utensils },
  { name: "art & culture", icon: Palette },
  { name: "sightseeing", icon: Camera },
  { name: "nautical", icon: Sailboat },
  { name: "wellness", icon: BiSpa },
  { name: "beauty", icon: Heart },
  { name: "shopping", icon: ShoppingBag },
  { name: "tour", icon: LuBinoculars },
  { name: "class", icon: Presentation },
  { name: "cooking", icon: LuCookingPot },
  { name: "transportation", icon: Car },
  { name: "travel", icon: BaggageClaim },
  { name: "history", icon: LuAmphora },
  { name: "nature", icon: Trees },
  { name: "music", icon: Music },
  { name: "nightlife", icon: MdOutlineNightlife },
  { name: "performance", icon: Drama },
  { name: "workout", icon: Dumbbell },
]

export const itineraryTags = [
  { name: "relaxing", icon: Sparkles },
  { name: "wellness", icon: TbYoga },
  { name: "culinary", icon: ChefHat },
  { name: "business", icon: Briefcase },
  { name: "cultural", icon: Building },
  { name: "backpacking", icon: Backpack },
  { name: "tropical", icon: Palmtree },
  { name: "romantic", icon: Wine },
  { name: "digital nomad", icon: Camera },
  { name: "solo", icon: FaPersonWalkingLuggage },
  { name: "weekend", icon: CalendarFold },
  { name: "cruise", icon: Ship },
  { name: "sustainable", icon: Sprout },
  { name: "medical", icon: Syringe },
  { name: "educational", icon: BookMarked },
  { name: "rural", icon: PiFarm },
  { name: "urban", icon: FaCity },
  { name: "spiritual", icon: Church },
  { name: "dark tourism", icon: Skull },
  { name: "luxury", icon: HandPlatter },
  { name: "budget", icon: Coins },
  { name: "road trip", icon: Caravan },
  { name: "volunteering", icon: Handshake },
  { name: "adventure", icon: RollerCoaster },
  { name: "multi-country", icon: LuTicketsPlane },
  { name: "action packed", icon: Music },
]

export const sortOptions = [
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