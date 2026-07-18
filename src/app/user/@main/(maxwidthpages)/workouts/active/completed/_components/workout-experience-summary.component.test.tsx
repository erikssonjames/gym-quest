import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { render } from "../../../../../../../../../tests/support/render"
import { WorkoutExperienceSummary } from "./workout-experience-summary"

describe("WorkoutExperienceSummary", () => {
  const beforeProgression = {
    level: 2,
    totalExperience: 800,
    experienceIntoLevel: 300,
    experienceForLevel: 1_500,
    experienceToNextLevel: 1_200,
    progressPercent: 20,
  }
  const afterProgression = {
    level: 2,
    totalExperience: 1_592,
    experienceIntoLevel: 1_092,
    experienceForLevel: 1_500,
    experienceToNextLevel: 408,
    progressPercent: 72.8,
  }

  test("shows the total and every source of workout XP", () => {
    render(
      <WorkoutExperienceSummary
        afterProgression={afterProgression}
        beforeProgression={beforeProgression}
        experience={{
          activeTime: 56,
          finish: 200,
          reps: 160,
          sets: 120,
          total: 792,
          volume: 256,
          wasCapped: false,
        }}
        reviewStatus={null}
      />,
    )

    expect(screen.getByLabelText("792 workout XP earned")).toBeInTheDocument()
    expect(screen.getByText("Finish")).toBeInTheDocument()
    expect(screen.getByText("Completed sets")).toBeInTheDocument()
    expect(screen.getByText("Repetitions")).toBeInTheDocument()
    expect(screen.getByText("Weight moved")).toBeInTheDocument()
    expect(screen.getByText("Active time")).toBeInTheDocument()
    expect(screen.queryByText(/workout cap was applied/i)).not.toBeInTheDocument()
  })

  test("explains when the workout cap limits the total", () => {
    render(
      <WorkoutExperienceSummary
        afterProgression={afterProgression}
        beforeProgression={beforeProgression}
        experience={{
          activeTime: 900,
          finish: 200,
          reps: 1_200,
          sets: 300,
          total: 2_000,
          volume: 1_200,
          wasCapped: true,
        }}
        reviewStatus={null}
      />,
    )

    expect(screen.getByText("The 2,000 XP workout cap was applied.")).toBeInTheDocument()
  })

  test("explains that flagged workout XP is withheld", () => {
    render(
      <WorkoutExperienceSummary
        afterProgression={beforeProgression}
        beforeProgression={beforeProgression}
        experience={{
          activeTime: 7,
          finish: 50,
          reps: 40,
          sets: 15,
          total: 152,
          volume: 40,
          wasCapped: false,
        }}
        reviewStatus="pending"
      />,
    )

    expect(screen.getByText("XP is pending review")).toBeInTheDocument()
    expect(screen.getByText(/no XP, quest progress, or training achievements/i)).toBeInTheDocument()
  })
})
