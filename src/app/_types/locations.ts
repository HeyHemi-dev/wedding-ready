import { Location, Service } from '@/db/constants'
import { LocationPretty } from '@/db/location-descriptions'

export type FindSuppliersResponse = {
  type: 'location' | 'service'
  key: string
  value: string
  supplierCount: number
}

export type LocationItem = {
  key: Location
  pretty: LocationPretty
}

export type LocationList = LocationItem[]

export type LocationPage = {
  key: Location
  title: string
  description: string
}

export type ServicePage = {
  key: Service
  title: string
  description: string
}
