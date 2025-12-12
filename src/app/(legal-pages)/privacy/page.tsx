import { readFileSync } from 'fs'
import { join } from 'path'

import { InformationalPageLayout } from '@/components/informational-pages/informational-page-layout'

export default function PrivacyPage() {
  const privacyPolicy = readFileSync(join(process.cwd(), 'src', 'app', '(legal-pages)', 'privacy', 'privacy-policy.md'), 'utf8')

  return <InformationalPageLayout title="Privacy Policy" markdown={privacyPolicy} />
}
