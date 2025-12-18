import { redirect } from 'next/navigation'

export default function SignUpConfirmation() {
  // Redirect to check-inbox page (replaces this page)
  redirect('/check-inbox')
}
