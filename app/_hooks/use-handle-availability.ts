import { useEffect, useState, useRef } from 'react'
import { useDebounce } from './use-debounce'
import { tryCatchFetch } from '@/utils/try-catch'

export type HandleGetResponseBody = {
  isAvailable: boolean
}

export const endpoint = {
  supplier: '/api/suppliers/check-handle',
  user: '/api/users/check-handle',
} as const

export const AvailableStatus = {
  Undefined: undefined,
  Pending: 'Pending',
  Error: 'Error',
  Available: true,
  Taken: false,
} as const

type AvailableStatus = (typeof AvailableStatus)[keyof typeof AvailableStatus]
type EndpointKey = keyof typeof endpoint

export function useHandleAvailability({ enabled, value, checkFor }: { enabled: boolean; value: string; checkFor: EndpointKey }): {
  status: AvailableStatus
} {
  const [status, setStatus] = useState<AvailableStatus>(AvailableStatus.Undefined)
  const debouncedValue = useDebounce(value, 500)
  const lastRequestId = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      setStatus(AvailableStatus.Undefined)
      return
    }

    setStatus(AvailableStatus.Pending)
    const currentRequestId = ++lastRequestId.current
    const controller = new AbortController()

    async function fetchAvailability() {
      const { data, error } = await tryCatchFetch<HandleGetResponseBody>(`${endpoint[checkFor]}/${debouncedValue}`, { signal: controller.signal })

      if (currentRequestId === lastRequestId.current) {
        if (error) {
          setStatus(AvailableStatus.Error)
        } else if (data) {
          setStatus(data.isAvailable)
        }
      }
    }

    fetchAvailability()

    return () => {
      controller.abort()
    }
  }, [debouncedValue, checkFor, enabled])

  return { status }
}
