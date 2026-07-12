const PROVIDERS_ARRAY = ['credentials', 'discord'] as const;
const SYSTEM_USER_ID = "00000000-0000-4000-8000-000000000001";
type PROVIDER = typeof PROVIDERS_ARRAY[number]

export {
  PROVIDERS_ARRAY,
  SYSTEM_USER_ID,
  type PROVIDER
}
