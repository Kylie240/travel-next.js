"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { MapPin, Calendar, Wallet, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SearchArea() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    try {
      setIsSearching(true);

      // Build search params
      const searchParams = new URLSearchParams({
        ...(destination && destination !== "any" && { destination }),
        ...(duration && duration !== "any" && { duration }),
        ...(budget && budget !== "any" && { budget }),
      });

      // Navigate to explore page with search params
      router.push(`/explore?${searchParams.toString()}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg relative z-[1]">
      <form onSubmit={handleSearch} className="flex items-end gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="Any destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-white placeholder:text-black"
              disabled={isSearching}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration} disabled={isSearching}>
              <SelectTrigger id="duration" className="bg-white">
                <SelectValue placeholder="Any duration"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Duration</SelectItem>
                <SelectItem value="1-3">1-3 days</SelectItem>
                <SelectItem value="3-5">3-5 days</SelectItem>
                <SelectItem value="6-8">6-8 days</SelectItem>
                <SelectItem value="9-12">9-12 days</SelectItem>
                <SelectItem value="13+">13+ days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Budget Range
            </Label>
            <Select value={budget} onValueChange={setBudget} disabled={isSearching}>
              <SelectTrigger id="budget" className="bg-white" defaultValue="any">
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Budget</SelectItem>
                <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                <SelectItem value="1000-3000">$1,000 - $3,000</SelectItem>
                <SelectItem value="3000-5000">$3,000 - $5,000</SelectItem>
                <SelectItem value="5000+">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-full mt-1 bg-black block md:hidden"
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <p>Search</p>
          )}
        </Button>
        </div>

        <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-10 bg-black hidden md:flex"
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
} 