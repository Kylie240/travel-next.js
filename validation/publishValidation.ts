import { z } from "zod"
import { createSchema } from "./createSchema"

export type PublishValidationIssue = {
  step: number
  stepName: string
  fieldLabel: string
  message: string
}

const STEP_NAMES: Record<number, string> = {
  1: "Basics",
  2: "Plan Days",
  3: "Final Details",
  4: "Advanced Settings",
}

function getStepForPath(path: (string | number)[]): number {
  const root = String(path[0])

  if (
    root === "title" ||
    root === "shortDescription" ||
    root === "mainImage" ||
    root === "detailedOverview" ||
    root === "duration"
  ) {
    return 1
  }

  if (root === "days" || root === "cities") {
    return 2
  }

  if (root === "itineraryTags" || root === "notes" || root === "budget") {
    return 3
  }

  return 1
}

function formatFieldLabel(path: (string | number)[]): string {
  const root = String(path[0])

  if (root === "title") return "Trip Name"
  if (root === "shortDescription") return "Short Description"
  if (root === "mainImage") return "Cover Image"
  if (root === "detailedOverview") return "Detailed Overview"
  if (root === "duration") return "Number of Days"
  if (root === "cities") return "Cities"
  if (root === "itineraryTags") return "Categories"
  if (root === "days" && path.length === 1) return "Days"

  if (root === "days" && typeof path[1] === "number") {
    const dayNum = path[1] + 1
    const field = path[2]

    if (field === "title") return `Day ${dayNum} title`
    if (field === "cityName") return `Day ${dayNum} city`
    if (field === "countryName") return `Day ${dayNum} country`
    if (field === "description") return `Day ${dayNum} description`

    if (field === "activities" && typeof path[3] === "number") {
      const activityNum = path[3] + 1
      const activityField = path[4]

      if (activityField === "title") return `Day ${dayNum}, Activity ${activityNum} title`
      if (activityField === "time") return `Day ${dayNum}, Activity ${activityNum} time`
      return `Day ${dayNum}, Activity ${activityNum}`
    }

    return `Day ${dayNum}`
  }

  return "Required field"
}

export function getPublishValidationIssues(
  data: z.infer<typeof createSchema>
): PublishValidationIssue[] {
  const result = createSchema.safeParse(data)
  if (result.success) return []

  return result.error.issues.map((issue) => {
    const step = getStepForPath(issue.path)
    const stepName = STEP_NAMES[step] ?? `Step ${step}`
    const fieldLabel = formatFieldLabel(issue.path)

    return {
      step,
      stepName,
      fieldLabel,
      message: issue.message,
    }
  })
}

export function formatPublishValidationToast(issues: PublishValidationIssue[]): {
  title: string
  description: string
} {
  const first = issues[0]
  const location = `Go to Step ${first.step} (${first.stepName}) to fix this.`

  if (issues.length === 1) {
    return {
      title: `Missing ${first.fieldLabel}`,
      description: `${first.message}. ${location}`,
    }
  }

  const otherFields = issues
    .slice(1, 4)
    .map((issue) => issue.fieldLabel)
    .join(", ")

  const remainingCount = issues.length - 4
  const moreText =
    remainingCount > 0 ? `, and ${remainingCount} more` : ""

  return {
    title: `Missing ${first.fieldLabel}`,
    description: `${first.message}. ${location} Also check: ${otherFields}${moreText}.`,
  }
}
