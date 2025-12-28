import z from 'zod'

import { PARAMS } from '@/utils/constants'
import { cn } from '@/utils/shadcn-utils'

export const MESSAGE_TYPES = ['success', 'error', 'info'] as const
export type messageType = (typeof MESSAGE_TYPES)[number]
export const MESSAGE_CODES = {
  INVALID_AUTH_REQUEST: 'invalid_auth_request',
  AUTH_FAILED: 'auth_failed',
  INVALID_PASSWORD_RESET_SESSION: 'password_reset_invalid_session',
  PASSWORD_RESET_SENT: 'password_reset_sent',
  PASSWORD_RESET_FAILED: 'password_reset_failed',
} as const
export type messageCode = (typeof MESSAGE_CODES)[keyof typeof MESSAGE_CODES]

export const messageSchema = z.object({
  [PARAMS.AUTH_MESSAGE_CODE]: z.nativeEnum(MESSAGE_CODES),
})
export type Message = z.infer<typeof messageSchema>

export function AuthMessage({ message }: { message: Message }) {
  const messageData = MESSAGE_DATA[message[PARAMS.AUTH_MESSAGE_CODE]]

  return (
    <div className="ui-small flex w-full max-w-md flex-col gap-sibling">
      <div
        className={cn(
          'rounded border border-border bg-background px-md py-sm text-foreground',
          messageData.type === 'success' && 'bg-secondary text-secondary-foreground',
          messageData.type === 'error' && 'bg-destructive/10 text-destructive',
          messageData.type === 'info' && 'bg-amber-600/10 text-foreground'
        )}>
        {messageData.content}
      </div>
    </div>
  )
}

const MESSAGE_DATA = {
  [MESSAGE_CODES.INVALID_AUTH_REQUEST]: {
    type: 'error',
    content: 'Invalid authentication request. Please try signing in again.',
  },
  [MESSAGE_CODES.AUTH_FAILED]: {
    type: 'error',
    content: 'Authentication failed. Please try again.',
  },
  [MESSAGE_CODES.INVALID_PASSWORD_RESET_SESSION]: {
    type: 'info',
    content: 'Please request a password reset first.',
  },
  [MESSAGE_CODES.PASSWORD_RESET_SENT]: {
    type: 'success',
    content: 'Password reset email sent. Please check your inbox.',
  },
  [MESSAGE_CODES.PASSWORD_RESET_FAILED]: {
    type: 'error',
    content: 'Could not reset password. Please try again.',
  },
} satisfies Record<messageCode, { type: messageType; content: string }>
