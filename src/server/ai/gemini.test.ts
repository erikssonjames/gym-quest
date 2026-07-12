import { HttpResponse, http } from "msw"
import { describe, expect, test } from "vitest"

import { mockServer } from "../../../tests/support/mock-server"
import { generateWorkoutAiResponse } from "./gemini"

const endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"

describe("Gemini workout generation", () => {
  test("sends a server-side request and returns parsed usage", async () => {
    mockServer.use(
      http.post(endpoint, async ({ request }) => {
        expect(request.headers.get("x-goog-api-key")).toBe("test-gemini-key")
        await expect(request.json()).resolves.toMatchObject({
          contents: [{ role: "user", parts: [{ text: "Build a workout" }] }],
          generationConfig: { responseMimeType: "application/json" },
        })

        return HttpResponse.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      phase: "clarifying",
                      assistantMessage: "Which muscle group should we focus on?",
                      draft: null,
                    }),
                  },
                ],
              },
            },
          ],
          usageMetadata: {
            promptTokenCount: 120,
            candidatesTokenCount: 30,
            totalTokenCount: 150,
          },
        })
      }),
    )

    await expect(
      generateWorkoutAiResponse({
        messages: [{ role: "user", content: "Build a workout" }],
        exerciseCatalog: [],
      }),
    ).resolves.toEqual({
      response: {
        phase: "clarifying",
        assistantMessage: "Which muscle group should we focus on?",
        draft: null,
      },
      usage: {
        model: "gemini-2.5-flash-lite",
        inputTokens: 120,
        outputTokens: 30,
        totalTokens: 150,
      },
    })
  })

  test("surfaces the provider error without contacting Gemini", async () => {
    mockServer.use(
      http.post(endpoint, () =>
        HttpResponse.json(
          { error: { message: "Quota exhausted" } },
          { status: 429 },
        ),
      ),
    )

    await expect(
      generateWorkoutAiResponse({
        messages: [{ role: "user", content: "Build a workout" }],
        exerciseCatalog: [],
      }),
    ).rejects.toThrow("Quota exhausted")
  })
})
