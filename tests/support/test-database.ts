import "../setup/env"

import { migrate } from "drizzle-orm/postgres-js/migrator"

import { createDatabase } from "@/server/db"

const testDatabase = createDatabase(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 5,
  ssl: false,
})

export const testDb = testDatabase.db
export const testClient = testDatabase.client

export async function resetTestDatabase() {
  await testDatabase.client.unsafe("drop schema if exists public cascade")
  await testDatabase.client.unsafe("drop schema if exists drizzle cascade")
  await testDatabase.client.unsafe("create schema public")
  await migrate(testDb, { migrationsFolder: "drizzle" })
}

export async function truncateTestDatabase() {
  const tables = await testDatabase.client<{
    tablename: string
  }[]>`select tablename from pg_tables where schemaname = 'public'`

  if (tables.length === 0) return

  const tableNames = tables
    .map(({ tablename }) => `"${tablename.replaceAll('"', '""')}"`)
    .join(", ")

  await testDatabase.client.unsafe(
    `truncate table ${tableNames} restart identity cascade`,
  )
}

export async function closeTestDatabase() {
  await testDatabase.client.end()
}
