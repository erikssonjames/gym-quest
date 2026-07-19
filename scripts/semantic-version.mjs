import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const semanticVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

export function validateVersion(version) {
  if (!semanticVersionPattern.test(version)) {
    throw new Error(`Expected a semantic version such as 1.24.5, received: ${version}`)
  }

  return version
}

export function classifyRelease(commitLog) {
  const commits = commitLog
    .split("\x1e")
    .map((commit) => commit.trim())
    .filter(Boolean)

  const hasMajorChange = commits.some((commit) => {
    const [subject = ""] = commit.split(/\r?\n/)

    return (
      /^[a-z][a-z0-9-]*(?:\([^)]+\))?!:/i.test(subject) ||
      /^BREAKING(?: |-)?CHANGE:/im.test(commit) ||
      /^major(?:\s*:|\s+refactor\b)/i.test(subject)
    )
  })

  if (hasMajorChange) {
    return "major"
  }

  const hasMinorChange = commits.some((commit) => {
    const [subject = ""] = commit.split(/\r?\n/)

    return /^feat(?:\([^)]+\))?:/i.test(subject) || /^minor\s*:/i.test(subject)
  })

  return hasMinorChange ? "minor" : "patch"
}

export function incrementVersion(version, releaseType) {
  validateVersion(version)

  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number)

  if (releaseType === "major") {
    return `${major + 1}.0.0`
  }

  if (releaseType === "minor") {
    return `${major}.${minor + 1}.0`
  }

  if (releaseType === "patch") {
    return `${major}.${minor}.${patch + 1}`
  }

  throw new Error(`Unknown release type: ${releaseType}`)
}

function run() {
  const [command, ...args] = process.argv.slice(2)

  if (command === "validate") {
    process.stdout.write(validateVersion(args[0] ?? ""))
    return
  }

  if (command === "classify") {
    process.stdout.write(classifyRelease(readFileSync(0, "utf8")))
    return
  }

  if (command === "increment") {
    process.stdout.write(incrementVersion(args[0] ?? "", args[1] ?? ""))
    return
  }

  throw new Error("Usage: semantic-version.mjs validate|classify|increment")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
}
