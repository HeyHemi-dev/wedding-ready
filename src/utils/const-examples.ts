import { SERVICES, LOCATIONS } from '@/db/constants'

import { serviceHelpers, locationHelpers } from './const-helpers'

// This file demonstrates all the ways to work with the new const objects
// vs the old enum approach

export function demonstrateConstUsage() {
  // 1. DIRECT ACCESS - Much simpler than enums!
  const photographerValue = SERVICES.PHOTOGRAPHER // 'photographer'
  const aucklandValue = LOCATIONS.AUCKLAND // 'auckland'

  // 2. GET KEY FROM VALUE - Super easy!
  const photographerKey = serviceHelpers.valueToKey('photographer') // 'PHOTOGRAPHER'

  // 3. GET VALUE FROM KEY - Also easy!
  const photographerValue2 = serviceHelpers.keyToValue('PHOTOGRAPHER') // 'photographer'

  // 4. GET ALL PRETTY OPTIONS FOR DROPDOWNS
  const serviceOptions = serviceHelpers.toPretty()
  // Returns: [{ key: 'PHOTOGRAPHER', value: 'photographer', label: 'Photographer' }, ...]

  const locationOptions = locationHelpers.toPretty()
  // Returns: [{ key: 'AUCKLAND', value: 'auckland', label: 'Auckland' }, ...]

  // 5. URL PARAMETER CONVERSION
  const photographerParam = serviceHelpers.keyToParam('PHOTOGRAPHER') // 'photographer'

  // 6. CONVERT URL PARAM BACK TO VALUE
  const photographerFromParam = serviceHelpers.paramToValue('photographer') // 'photographer'

  // 7. TYPE SAFETY - TypeScript knows exactly what values are valid
  // This would cause a TypeScript error:
  // const invalidService = SERVICES.INVALID_SERVICE // ❌ Error!

  // But this works:
  const validService = SERVICES.PHOTOGRAPHER // ✅ Works!

  // 8. COMPARISON - Much cleaner than enum comparisons
  const isPhotographer = photographerValue === SERVICES.PHOTOGRAPHER // true
  const isAuckland = aucklandValue === LOCATIONS.AUCKLAND // true

  // 9. ARRAY OPERATIONS
  const allServiceValues = Object.values(SERVICES) // ['venue', 'accomodation', ...]

  // 10. CONDITIONAL LOGIC
  const serviceType = photographerValue === SERVICES.PHOTOGRAPHER ? 'capture' : 'other'
  const locationRegion = aucklandValue === LOCATIONS.AUCKLAND ? 'north' : 'other'

  return {
    photographerValue,
    photographerKey,
    serviceOptions,
    locationOptions,
    photographerParam,
    isPhotographer,
    allServiceValues,
    serviceType,
    locationRegion,
    photographerValue2,
    photographerFromParam,
    validService,
    isAuckland,
  }
}

// Example: How this replaces the old enum pain
export function oldVsNewComparison() {
  // OLD WAY (with enums):
  // enum Service { PHOTOGRAPHER = 'photographer' }
  // const value = Service.PHOTOGRAPHER // 'photographer'
  // const key = Object.keys(Service).find(k => Service[k as keyof typeof Service] === 'photographer') // 'PHOTOGRAPHER'
  // const pretty = enumToPretty(Service) // Complex helper needed

  // NEW WAY (with const objects):
  const value = SERVICES.PHOTOGRAPHER // 'photographer'
  const key = serviceHelpers.valueToKey('photographer') // 'PHOTOGRAPHER'
  const pretty = serviceHelpers.toPretty() // Simple helper

  return { value, key, pretty }
}
