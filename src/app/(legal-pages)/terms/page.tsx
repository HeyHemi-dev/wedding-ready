import { readFileSync } from 'fs'
import { join } from 'path'

import { InformationalPageLayout } from '@/components/informational-pages/informational-page-layout'

export default async function TermsPage() {
  const termsOfUse = readFileSync(join(process.cwd(), 'src', 'app', '(legal-pages)', 'terms', 'terms-of-use.md'), 'utf8')

  return <InformationalPageLayout title="Terms of Use" markdown={termsOfUse} />
}
