import { InformationalPageLayout, UnsafeMarkdown } from '@/components/informational-pages/informational-page-layout'
import { readFileSync } from 'fs'
import { join } from 'path'

export default async function TermsPage() {
  const privacyPolicy = readFileSync(join(process.cwd(), 'src', 'app', '(legal-pages)', 'privacy', 'privacy-policy.md'), 'utf8')

  return <InformationalPageLayout title="Privacy Policy" content={privacyPolicy as UnsafeMarkdown} />
}
