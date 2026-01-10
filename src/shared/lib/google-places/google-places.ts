import { GOOGLE_MAPS_API_KEY } from '@/shared/env'

export interface GooglePlacesPrediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export interface GooglePlaceDetails {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface GoogleReverseGeocodeResult {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
}

type PlacesAutocompleteResponse = {
  status: string
  error_message?: string
  predictions?: {
    description?: string
    place_id?: string
    structured_formatting?: {
      main_text?: string
      secondary_text?: string
    }
  }[]
}

type PlacesDetailsResponse = {
  status: string
  error_message?: string
  result?: {
    name?: string
    formatted_address?: string
    geometry?: {
      location?: {
        lat?: number
        lng?: number
      }
    }
  }
}

type GeocodeResponse = {
  status: string
  error_message?: string
  results?: {
    formatted_address?: string
    place_id?: string
    address_components?: {
      long_name?: string
      short_name?: string
      types?: string[]
    }[]
  }[]
}

function buildUrl(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>,
) {
  const url = new URL(baseUrl)
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}

export async function googlePlacesAutocomplete(params: {
  input: string
  language?: string
  apiKey?: string
  signal?: AbortSignal
}): Promise<GooglePlacesPrediction[]> {
  const apiKey = params.apiKey ?? GOOGLE_MAPS_API_KEY
  if (!apiKey) return []

  const input = params.input.trim()
  if (!input) return []

  const url = buildUrl(
    'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    {
      input,
      key: apiKey,
      language: params.language,
      types: 'geocode',
    },
  )

  const res = await fetch(url, { signal: params.signal })
  const json = (await res.json()) as PlacesAutocompleteResponse

  if (json.status !== 'OK' || !Array.isArray(json.predictions)) return []

  return json.predictions
    .map((p) => {
      const placeId = p.place_id ?? ''
      const description = p.description ?? ''
      const mainText = p.structured_formatting?.main_text ?? ''
      const secondaryText = p.structured_formatting?.secondary_text ?? ''
      if (!placeId || !description) return null
      return { placeId, description, mainText, secondaryText }
    })
    .filter((x): x is GooglePlacesPrediction => Boolean(x))
}

export async function googlePlaceDetails(params: {
  placeId: string
  language?: string
  apiKey?: string
  signal?: AbortSignal
}): Promise<GooglePlaceDetails | null> {
  const apiKey = params.apiKey ?? GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  const placeId = params.placeId.trim()
  if (!placeId) return null

  const url = buildUrl(
    'https://maps.googleapis.com/maps/api/place/details/json',
    {
      place_id: placeId,
      key: apiKey,
      language: params.language,
      fields: 'place_id,name,formatted_address,geometry/location',
    },
  )

  const res = await fetch(url, { signal: params.signal })
  const json = (await res.json()) as PlacesDetailsResponse

  if (json.status !== 'OK' || !json.result) return null

  const latitude = json.result.geometry?.location?.lat
  const longitude = json.result.geometry?.location?.lng
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null

  return {
    placeId,
    name: json.result.name ?? '',
    address: json.result.formatted_address ?? '',
    latitude,
    longitude,
  }
}

function guessNameFromFormattedAddress(formatted: string) {
  const firstPart = formatted.split(',')[0]?.trim()
  return firstPart || formatted
}

export async function googleReverseGeocode(params: {
  latitude: number
  longitude: number
  language?: string
  apiKey?: string
  signal?: AbortSignal
}): Promise<GoogleReverseGeocodeResult | null> {
  const apiKey = params.apiKey ?? GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  if (!Number.isFinite(params.latitude) || !Number.isFinite(params.longitude))
    return null

  const url = buildUrl('https://maps.googleapis.com/maps/api/geocode/json', {
    latlng: `${params.latitude},${params.longitude}`,
    key: apiKey,
    language: params.language,
    result_type: 'street_address|route|premise|point_of_interest',
  })

  const res = await fetch(url, { signal: params.signal })
  const json = (await res.json()) as GeocodeResponse
  if (json.status !== 'OK' || !Array.isArray(json.results) || !json.results[0])
    return null

  const first = json.results[0]
  const placeId = first.place_id ?? ''
  const address = first.formatted_address ?? ''
  if (!placeId || !address) return null

  const nameFromComponents =
    first.address_components?.[0]?.long_name?.trim() ?? ''
  const name = nameFromComponents || guessNameFromFormattedAddress(address)

  return {
    placeId,
    name,
    address,
    latitude: params.latitude,
    longitude: params.longitude,
  }
}
