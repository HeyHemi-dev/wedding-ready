import Link from 'next/link'

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-friend">
      <div className="grid">
        <p className="ui-large">Dream. Plan. Book.</p>
        <h1 className="ui-large text-muted-foreground">{title}</h1>
      </div>
      {children}
      <p className="ui-small text-muted-foreground">
        {'By continuing, you acknowledge that you understand and agree to our '}
        <Link className="underline" href="/terms">
          Terms of Service
        </Link>
        {' and '}
        <Link className="underline" href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
