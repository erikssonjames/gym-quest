import jwt from "jsonwebtoken"
import { describe, expect, test } from "vitest"

import { createSocketToken, verifySocketToken } from "./auth"

const userId = "6fd4067a-18a2-47f5-8aed-311d52c2f7c9"

describe("socket authentication", () => {
  test("round-trips a short-lived token for the intended user", () => {
    const token = createSocketToken(userId)

    expect(verifySocketToken(token)).toBe(userId)
  })

  test("rejects tokens issued for a different purpose", () => {
    const token = jwt.sign(
      { purpose: "email-verification" },
      process.env.SERVER_SOCKET_KEY!,
      { subject: userId, expiresIn: "10m" },
    )

    expect(() => verifySocketToken(token)).toThrow()
  })

  test("rejects expired and malformed tokens", () => {
    const expiredToken = jwt.sign(
      { purpose: "socket" },
      process.env.SERVER_SOCKET_KEY!,
      { subject: userId, expiresIn: -1 },
    )

    expect(() => verifySocketToken(expiredToken)).toThrow()
    expect(() => verifySocketToken("not-a-jwt")).toThrow()
  })
})
