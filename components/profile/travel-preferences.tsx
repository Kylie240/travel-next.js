import { Heart, Award, Globe, Flag } from "lucide-react"

interface TravelPreferencesProps {
  preferences: {
    interests: string[]
    travelStyle: string[]
    languages: string[]
    visitedCountries: string[]
  }
}

export function TravelPreferences({ preferences }: TravelPreferencesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">Travel Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5" /> Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.interests.map((interest, index) => (
              <span key={index} className="px-3 py-1 bg-travel-50 text-travel-900 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Award className="h-5 w-5" /> Travel Style
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.travelStyle.map((style, index) => (
              <span key={index} className="px-3 py-1 bg-travel-50 text-travel-900 rounded-full text-sm">
                {style}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5" /> Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.languages.map((language, index) => (
              <span key={index} className="px-3 py-1 bg-travel-50 text-travel-900 rounded-full text-sm">
                {language}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Flag className="h-5 w-5" /> Countries Visited
          </h3>
          <div className="flex flex-wrap gap-2">
            {preferences.visitedCountries.map((country, index) => (
              <span key={index} className="px-3 py-1 bg-travel-50 text-travel-900 rounded-full text-sm">
                {country}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 