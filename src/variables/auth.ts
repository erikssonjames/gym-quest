const PROVIDERS_ARRAY = ['credentials', 'discord'] as const;
type PROVIDER = typeof PROVIDERS_ARRAY[number]

export {
  PROVIDERS_ARRAY,
  type PROVIDER
}