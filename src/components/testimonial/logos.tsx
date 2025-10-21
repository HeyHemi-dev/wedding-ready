import React from 'react'

interface Logo {
  name: string
  logo: string
}

interface LogosProps {
  title?: string
  logos?: Logo[]
}

export function Logos({ title, logos = [] }: LogosProps) {
  return (
    <div className="grid gap-friend">
      <div className="flex flex-wrap items-center justify-around gap-sibling">
        {logos.map((logo) => (
          <React.Fragment key={logo.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.logo}
              alt={`${logo.name} logo`}
              className="aspect-square w-36 object-contain opacity-50 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
            />
          </React.Fragment>
        ))}
      </div>
      <p className="ui text-center text-muted-foreground">{title}</p>
    </div>
  )
}
