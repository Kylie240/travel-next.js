"use client";

import { useState } from "react";
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
import { MapPin, Calendar, Wallet, Search } from "lucide-react";

export function SearchArea() {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log({ destination, duration, budget });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <form onSubmit={handleSearch} className="flex items-end gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="Where do you want to go?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration" className="bg-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
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
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger id="budget" className="bg-white">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                <SelectItem value="1000-3000">$1,000 - $3,000</SelectItem>
                <SelectItem value="3000-5000">$3,000 - $5,000</SelectItem>
                <SelectItem value="5000+">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" size="icon" className="h-10 w-10 bg-black">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
} 