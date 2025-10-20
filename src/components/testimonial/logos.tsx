import React from 'react'

interface Logo {
  name: string
  logo: string
}

interface LogosProps {
  title?: string

  logos?: Logo[]
}

export function Logos({
  title = 'Trusted by New Zealand suppliers',

  logos = [
    {
      name: 'Together Journal',
      logo: '/assets/why-join-logos/together-transparent-black.png',
    },
    {
      name: 'Hooray',
      logo: '/assets/why-join-logos/hooray-transparent.png',
    },
    {
      name: 'Hello May',
      logo: '/assets/why-join-logos/hello-may-logo-transparent.png',
    },
  ],
}: LogosProps) {
  return (
    <div className="grid gap-friend">
      <h2 className="ui text-center text-muted-foreground">{title}</h2>
      <div className="order-first flex flex-wrap items-center justify-around gap-sibling">
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
    </div>
  )
}
