import assert from "node:assert/strict"
import test from "node:test"

import {
  classifyRelease,
  incrementVersion,
  validateVersion,
} from "./semantic-version.mjs"

test("validates readable semantic versions", () => {
  assert.equal(validateVersion("1.24.5"), "1.24.5")
  assert.throws(() => validateVersion("1.24.5+abc1234"), /Expected a semantic version/)
})

test("increments the number represented by the release type", () => {
  assert.equal(incrementVersion("1.24.5", "patch"), "1.24.6")
  assert.equal(incrementVersion("1.24.5", "minor"), "1.25.0")
  assert.equal(incrementVersion("1.24.5", "major"), "2.0.0")
})

test("classifies features as minor and fixes as patch releases", () => {
  assert.equal(classifyRelease("feat: add workout templates\x1e"), "minor")
  assert.equal(classifyRelease("minor: add workout templates\x1e"), "minor")
  assert.equal(classifyRelease("fix: prevent duplicate sessions\x1e"), "patch")
  assert.equal(classifyRelease("Update documentation\x1e"), "patch")
})

test("classifies breaking and major refactor commits as major releases", () => {
  assert.equal(classifyRelease("feat!: replace workout model\x1e"), "major")
  assert.equal(
    classifyRelease("feat: replace workout model\n\nBREAKING CHANGE: old plans need migration\x1e"),
    "major",
  )
  assert.equal(classifyRelease("major: replace workout model\x1e"), "major")
  assert.equal(classifyRelease("Major refactor of progression\x1e"), "major")
})

test("uses the highest release type in a group of commits", () => {
  const commitLog = [
    "fix: prevent duplicate sessions",
    "feat: add workout templates",
    "refactor!: replace progression storage",
  ].join("\x1e")

  assert.equal(classifyRelease(commitLog), "major")
})
