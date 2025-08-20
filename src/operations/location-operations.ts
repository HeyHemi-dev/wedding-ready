import { FindSuppliersResponse, LocationList, LocationPage } from '@/app/_types/locations'
import { LOCATIONS, Location } from '@/db/constants'
import { locationDescriptions, locationPretty } from '@/db/location-descriptions'
import { supplierLocationsModel } from '@/models/supplier-location'

export const locationOperations = {
  getFormattedList,
  getForPage,
  getAllWithSupplierCount,
}

function getFormattedList(): LocationList {
  return Object.values(LOCATIONS).map((key) => ({
    key,
    pretty: locationPretty[key],
  }))
}

function getForPage(location: Location): LocationPage {
  const description = locationDescriptions[location]

  return {
    key: location,
    title: description.title,
    description: description.description,
  }
}

async function getAllWithSupplierCount(): Promise<FindSuppliersResponse[]> {
  const supplierCounts = await supplierLocationsModel.getAllWithSupplierCount()

  // Map for quick lookup
  const countMap = new Map(supplierCounts.map(({ location, supplierCount }) => [location, supplierCount]))

  return Object.entries(LOCATIONS).map(([key, value]) => ({
    type: 'location',
    key,
    value,
    supplierCount: countMap.get(value) ?? 0,
  }))
}
