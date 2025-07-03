import { LucideIcon } from "lucide-react"

interface Achievement {
  title: string
  description: string
  icon: LucideIcon
}

interface AchievementsProps {
  achievements: Achievement[]
}

export function Achievements({ achievements }: AchievementsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
            <div className="h-12 w-12 rounded-full bg-travel-50 flex items-center justify-center">
              <achievement.icon className="h-6 w-6 text-travel-900" />
            </div>
            <div>
              <h3 className="font-semibold">{achievement.title}</h3>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 