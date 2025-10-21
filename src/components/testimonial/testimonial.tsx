import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TestimonialProps {
  quote?: string
  author?: {
    name: string
    role: string
    avatar: {
      src: string
      alt: string
    }
  }
}

export function Testimonial({
  quote = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.',
  author = {
    name: 'Customer Name',
    role: 'Role',
    avatar: {
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp',
      alt: 'Customer Name',
    },
  },
}: TestimonialProps) {
  return (
    <div className="grid justify-items-center gap-friend">
      <p className="ui-large text-balance text-center">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-sibling">
        <Avatar className="">
          <AvatarImage src={author.avatar.src} alt={author.avatar.alt} />
          <AvatarFallback>{author.name}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left">
          <p className="ui-small-s1">{author.name}</p>
          <p className="ui-small text-muted-foreground">{author.role}</p>
        </div>
      </div>
    </div>
  )
}
