import Image from 'next/image'

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
          <img key={logo.name} src={logo.logo} alt={`${logo.name} logo`} className="aspect-square w-36 object-contain" />
        ))}
      </div>
    </div>
  )
}
