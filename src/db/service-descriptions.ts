import { SERVICES, Service } from '@/db/constants'

export type ServicePretty = {
  value: string
}

export type ServiceDescription = {
  title: string
  description: string
}

export const servicePretty = {
  [SERVICES.ACCOMODATION]: {
    value: 'Accommodation',
  },
  [SERVICES.BAND]: {
    value: 'Band',
  },
  [SERVICES.BEAUTY]: {
    value: 'Beauty',
  },
  [SERVICES.BRIDAL_ACCESSORY]: {
    value: 'Bridal accessory',
  },
  [SERVICES.BRIDAL_WEAR]: {
    value: 'Bridal wear',
  },
  [SERVICES.BRIDESMAIDS_WEAR]: {
    value: 'Bridesmaid wear',
  },
  [SERVICES.CAKE]: {
    value: 'Cake',
  },
  [SERVICES.CATERER]: {
    value: 'Catering',
  },
  [SERVICES.CELEBRANT]: {
    value: 'Celebrant',
  },
  [SERVICES.ENTERTAINMENT]: {
    value: 'Entertainment',
  },
  [SERVICES.FLORIST]: {
    value: 'Florist',
  },
  [SERVICES.HAIR]: {
    value: 'Hair',
  },
  [SERVICES.HIRE]: {
    value: 'Hire',
  },
  [SERVICES.MAKEUP]: {
    value: 'Makeup',
  },
  [SERVICES.MC]: {
    value: 'MC',
  },
  [SERVICES.MENSWEAR]: {
    value: 'Menswear',
  },
  [SERVICES.MENSWEAR_ACCESSORY]: {
    value: 'Menswear accessory',
  },
  [SERVICES.PHOTOGRAPHER]: {
    value: 'Photographer',
  },
  [SERVICES.PLANNER]: {
    value: 'Planner',
  },
  [SERVICES.RINGS]: {
    value: 'Rings',
  },
  [SERVICES.STATIONERY]: {
    value: 'Stationery',
  },
  [SERVICES.STYLIST]: {
    value: 'Stylist',
  },
  [SERVICES.SUPPORT]: {
    value: 'Support',
  },
  [SERVICES.TRANSPORT]: {
    value: 'Transport',
  },
  [SERVICES.VENUE]: {
    value: 'Venue',
  },
  [SERVICES.VIDEOGRAPHER]: {
    value: 'Videographer',
  },
} as const satisfies Record<Service, ServicePretty>

export const serviceDescriptions = {
  [SERVICES.ACCOMODATION]: {
    title: 'New Zealand Wedding Accommodation',
    description:
      'If you’re bringing people together from all over, good accommodation can make or break the visit. Luckily, Aotearoa does hospitality well; think boutique cabins, lakeside lodges, and family-run motels where the kettle’s always on. These places aren’t just somewhere to sleep —they help set the tone for a relaxed and memorable weekend.',
  },
  [SERVICES.BAND]: {
    title: 'New Zealand Wedding Bands & DJs',
    description:
      'From soulful acoustic sets to high-energy dance floors, Kiwi musicians know how to read a room. Whether you want a jazz trio for cocktail hour, a DJ spinning vinyl, or full band energy, these performers bring the right vibe —and know when to turn it up.',
  },
  [SERVICES.BEAUTY]: {
    title: 'New Zealand Wedding Beauty Services',
    description:
      'These artists understand that less is often more, and that the best makeup is the kind that makes you feel like the best version of yourself. They’ll work with your skin, your style, and the elements —because a Kiwi wedding might mean anything from beach breezes to alpine air.',
  },
  [SERVICES.BRIDAL_ACCESSORY]: {
    title: 'New Zealand Bridal Jewellery & Accessories',
    description:
      'Jewellery, veils, capes, headpieces —these are the little details that bring the whole look together. Whether you’re making a statement or keeping things simple, the right piece should feel like an extension of you.',
  },
  [SERVICES.BRIDAL_WEAR]: {
    title: 'New Zealand Wedding Dresses',
    description:
      'Whether you’re after minimalist tailoring, vintage glamour, or something entirely off-script, Aotearoa’s bridal scene has the range. These bridalwear specialists know how to listen, offer honest direction, and guide you toward something that feels like you —comfortable, expressive, and right for the day you’re planning.',
  },
  [SERVICES.BRIDESMAIDS_WEAR]: {
    title: 'New Zealand Bridesmaid Dresses',
    description:
      'Gone are the days of one-size-fits-all bridesmaid looks. Here, you’ll find designers and boutiques that understand that your squad is as unique as your friendship. Let them help you mix-and-match styles, source sustainable fabrics, choose pieces your team will actually wear again.',
  },
  [SERVICES.CAKE]: {
    title: 'New Zealand Wedding Cakes',
    description:
      'From three-tier showstoppers to towers of doughnuts or cheese wheels; cake is whatever you want it to be. Whether you’re after tradition or a modern twist, there is a baker here to help you sweeten the day.',
  },
  [SERVICES.CATERER]: {
    title: 'New Zealand Wedding Caterers',
    description:
      'Aotearoa’s food scene is a reflection of its rich, multicultural roots —grounded in the land, shaped by migration, and always evolving. From pāua fritters to biryani bowls, local caterers bring together flavours from across the globe with a distinct Kiwi ease. Expect menus built around local produce, relaxed service, and dishes that invite people to gather, share, and celebrate.',
  },
  [SERVICES.CELEBRANT]: {
    title: 'New Zealand Wedding Celebrants',
    description:
      'The right celebrant can change everything. These are the people who’ll hold the space, set the tone, and guide you through your most personal moments. Here, you’ll find celebrants who are inclusive, adaptable, and genuinely invested in your story.',
  },
  [SERVICES.ENTERTAINMENT]: {
    title: 'New Zealand Wedding Entertainment Services',
    description:
      'Looking for something a bit unexpected? From lawn games to live painting —entertainment goes beyond the dance floor. These suppliers can help you create a mood, break the ice, or just keep the fun rolling.',
  },
  [SERVICES.FLORIST]: {
    title: 'New Zealand Wedding Florists',
    description:
      'Our local florists have an incredible palette to work with. From delicate pōhutukawa to bold proteas, these creatives know how to work with what’s local and in season. They’ll help you create arrangements that feel organic, intentional, and true to the landscape you’re celebrating in.',
  },
  [SERVICES.HAIR]: {
    title: 'New Zealand Wedding Hair Stylists',
    description:
      'Are you after a relaxed beach wave that’ll hold through a coastal ceremony or an elegant updo that can handle a dance floor? These stylists get it. They understand that your hair should work with you, not against you —and that the best style is one that lets you forget about it and enjoy your day.',
  },
  [SERVICES.HIRE]: {
    title: 'New Zealand Wedding Hire Services',
    description:
      'From vintage furniture to modern glassware, hire companies help you build your vision without the commitment. They’re the practical solution to creating that perfect atmosphere, whether you’re after rustic charm, minimalist elegance, or something entirely unexpected. Let them handle the heavy lifting —literally.',
  },
  [SERVICES.MAKEUP]: {
    title: 'New Zealand Wedding Makeup Artists',
    description:
      'Makeup artists understand that natural beauty isn’t about looking like you’re not wearing makeup —it’s about looking like the best version of you. They’ll work with your skin, your style, and the elements to create a look that’s camera-ready but still feels authentic. Think glowing skin, defined features, and staying power that lasts from first look to last dance.',
  },
  [SERVICES.MC]: {
    title: 'New Zealand Professional Wedding MCs',
    description:
      'A good MC knows when to speak up and when to get out of the way. These pros can wrangle a rowdy crowd, smooth out the transitions, and keep the night on track —without becoming the centre of attention themselves',
  },
  [SERVICES.MENSWEAR]: {
    title: 'New Zealand Wedding Suits and Menswear',
    description:
      'Whether it’s a classic suit or something a bit more coastal-casual, the menswear scene here knows how to do both sharp and relaxed. Natural fibres, good fits, and nothing too try-hard. Here, you’ll find tailors who can help you walk that line in style.',
  },
  [SERVICES.MENSWEAR_ACCESSORY]: {
    title: 'New Zealand Wedding Menswear Accessories',
    description:
      'Ties, cufflinks, pāua shell pins, or socks that make you laugh; accessories offer a chance to show a bit of personality. Whether you’re honouring heritage, colour-coordinating, or just having fun, these details help pull the whole outfit into place.',
  },
  [SERVICES.PHOTOGRAPHER]: {
    title: 'New Zealand Wedding Photographers',
    description:
      'Kiwi photographers understand our unique light —brilliantly clear but often challenging —and know how to work with it to create magic. They’ll help you feel at ease in front of the lens, whether you’re on a windswept beach or in a hidden forest clearing. With a natural, relaxed approach that’s distinctly Kiwi, they capture both the epic landscapes and the intimate moments, creating images that feel authentic to you and your day.',
  },
  [SERVICES.PLANNER]: {
    title: 'New Zealand Wedding Planners',
    description:
      'Planning a wedding from afar can be daunting, but Kiwi planners are experts at turning your vision into reality. They’ll connect you with trusted local suppliers, keep you accountable and on track, and coordinate everything on the day. Whether you’re an expat or just busy, they take the pressure off, ensuring your celebration is seamless and stress-free.',
  },
  [SERVICES.RINGS]: {
    title: 'New Zealand Wedding Rings',
    description:
      'Worn every day, rings should feel like you. From classic gold bands to handcrafted taonga, there’s something meaningful about choosing a piece that reflects your story and values. These makers and jewellers can help you find the right fit.',
  },
  [SERVICES.STATIONERY]: {
    title: 'New Zealand Wedding Stationery',
    description:
      'From writing the perfect invite to hand-printed menus, and signage, Kiwi stationery designers blend traditional craft with modern style. They understand that your stationery sets the tone for your celebration and can guide you to incorporate local flora, cultural elements, or personal touches.',
  },
  [SERVICES.STYLIST]: {
    title: 'New Zealand Wedding Stylists',
    description:
      'Stylists don’t just make things look pretty —they create an atmosphere. They’ll think about lighting, textures, flow, and how it all ties together. Whether you’re going for refined or rustic, these creatives bring an editor’s eye and a practical mind.',
  },
  [SERVICES.SUPPORT]: {
    title: 'New Zealand Wedding Support Services',
    description:
      'Behind every good wedding is a crew that keeps things ticking. Whether it’s a dog sitting service, setup team, or on-the-day coordinator —this is where you’ll find the quiet MVPs who make the day seamless.',
  },
  [SERVICES.TRANSPORT]: {
    title: 'New Zealand Wedding Transportation Services',
    description:
      'Getting your guests from A to B in style is part of the adventure. Whether it’s a vintage car for the newlyweds, a helicopter for that remote photo op, or a boat to whisk your guests across the Marlborough Sounds, these transport providers know how to make the journey as memorable as the destination. They’ll help you navigate everything from mountain roads to coastal tracks.',
  },
  [SERVICES.VENUE]: {
    title: 'New Zealand Wedding Venues',
    description:
      'Kiwi weddings rarely stick to one mould, and these venues don’t either. From beachfront baches and vineyard barns to sleek city spots and high-country lodges, there’s a space here for every kind of celebration —big, small, traditional, or offbeat. Whether you’re after something laid-back or luxurious, what you’ll find is choice, character, and often, a view.',
  },
  [SERVICES.VIDEOGRAPHER]: {
    title: 'New Zealand Wedding Videographers',
    description:
      'Videographers and content creators bring a relaxed, cinematic approach to capturing your day. Whether it’s the heartfelt vows, the wild dance floor, or quiet moments in between, they’ll stitch together a story that reflects the real feel of your celebration. Many also offer short-form edits perfect for sharing with friends or posting on socials — so you can relive the magic and share it your way.',
  },
} as const satisfies Record<Service, ServiceDescription>
