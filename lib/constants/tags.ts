import { Mountain, Utensils, Building, Palmtree, Camera, Tent, Bike, Ship, Wine, Heart, Music, Sparkles, Waves, Star, Bookmark, Footprints, TentTree, Palette, ShoppingBag, Dumbbell, Drama, Trees, BaggageClaim, Car, Presentation } from "lucide-react"
import { FaSkiing, FaSafari, FaHiking } from "react-icons/fa"
import { GiAmphora, GiSnorkel } from "react-icons/gi"
import { BiSpa } from "react-icons/bi";
import { LuAmphora, LuBinoculars, LuCookingPot } from "react-icons/lu";
import { MdOutlineNightlife } from "react-icons/md";

export const activityTags = [
  { name: "outdoor", icon: TentTree },
  { name: "dining", icon: Utensils },
  { name: "art & culture", icon: Palette },
  { name: "sightseeing", icon: Camera },
  { name: "cruise", icon: Ship },
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
  { name: "relaxing", icon: Mountain },
  { name: "culinary", icon: Utensils },
  { name: "cultural", icon: Building },
  { name: "tropical", icon: Palmtree },
  { name: "romantic", icon: Camera },
  { name: "wellness", icon: Tent },
  { name: "luxury", icon: Bike },
  { name: "budget", icon: Ship },
  { name: "road trip", icon: Wine },
  { name: "volunteering", icon: Heart },
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