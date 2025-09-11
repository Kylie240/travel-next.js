import { Mountain, Utensils, Building, Palmtree, Camera, Ship, Wine, Heart, Music, TentTree, Palette, ShoppingBag, Dumbbell, Drama, Trees, BaggageClaim, Car, Presentation, HandPlatter, Caravan, Coins, HeartHandshake, RollerCoaster, Handshake, HandHeart, ChefHat, Briefcase, Backpack, BookMarked, Church, Skull, Sprout, Sailboat, CalendarFold, Syringe, Sparkles } from "lucide-react"
import { FaCity, FaHandSparkles, FaPersonWalkingLuggage } from "react-icons/fa6";
import { PiFarm } from "react-icons/pi";
import { BiSpa } from "react-icons/bi";
import { LuAmphora, LuBinoculars, LuBriefcaseMedical, LuCookingPot, LuTicketsPlane } from "react-icons/lu";
import { MdOutlineNightlife } from "react-icons/md";
import { TbYoga } from "react-icons/tb";

export const activityTagsMap = [
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

export const itineraryTagsMap = [
    { id:26, name :"Action Packed", icon: Music }, 
    { id:24, name :"Adventure", icon: RollerCoaster }, 
    { id:6, name :"Backpacking", icon: Backpack }, 
    { id:21, name :"Budget", icon: Coins }, 
    { id:4, name :"Business", icon: Briefcase }, 
    { id:12, name :"Cruise", icon: Ship }, 
    { id:3, name :"Culinary", icon: ChefHat }, 
    { id:5, name :"Cultural", icon: Building }, 
    { id:19, name :"Dark Tourism", icon: Skull }, 
    { id:9, name :"Digital Nomad", icon: Camera }, 
    { id:15, name :"Educational", icon: BookMarked }, 
    { id:20, name :"Luxury", icon: HandPlatter }, 
    { id:14, name :"Medical", icon: Syringe }, 
    { id:25, name :"Multi-Country", icon: LuTicketsPlane }, 
    { id:1, name :"Relaxing", icon: Sparkles }, 
    { id:22, name :"Road Trip", icon: Caravan }, 
    { id:8, name :"Romantic", icon: Wine }, 
    { id:16, name :"Rural", icon: PiFarm }, 
    { id:10, name :"Solo", icon: FaPersonWalkingLuggage }, 
    { id:18, name :"Spiritual", icon: Church }, 
    { id:13, name :"Sustainable", icon: Sprout }, 
    { id:7, name :"Tropical", icon: Palmtree }, 
    { id:17, name :"Urban", icon: FaCity }, 
    { id:23, name :"Volunteering", icon: Handshake }, 
    { id:11, name :"Weekend", icon: CalendarFold }, 
    { id:2, name :"Wellness", icon: TbYoga },
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