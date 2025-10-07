import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

export default function JoinAsSupplierPage() {
  return (
    <Section>
      <Area>
        <div>
          <h1>Show your work where couples are already dreaming</h1>
          <p>Every Tile credits your business, so “I love this” becomes “Let’s book them.”</p>
          <ul>
            <li>Join the platform where NZ couples turn moodboards into action</li>
            <li>Be credited, and credit others, to grow a collaborative community</li>
            <li>Free to start. No card required</li>
          </ul>
          <Button>Join as a supplier</Button>
        </div>
      </Area>
      {/* left image right text, image change on scroll */}
      <Area>
        <h2>How it works</h2>
        <ul>
          <li>
            Upload a Tile
            <p>Show your best work in context.</p>
          </li>
          <li>
            Credit collaborators
            <p>Tag the real NZ team so everyone gets visibility.</p>
          </li>
          <li>
            Get enquiries
            <p>Credits link straight to your profile. The next click is a message.</p>
          </li>
        </ul>
      </Area>
      {/* feature cards */}
      <div>
        <h2>Why suppliers choose WeddingReady</h2>
        <ul>
          <li>
            Reach couples earlier
            <p>Be seen while they're still dreaming, not price‑shopping.</p>
          </li>
          <li>
            Local visibility by design
            <p>Inspiration ties to the real NZ team who created it.</p>
          </li>
          <li>
            Premium presentation
            <p>Look like a feature, not a directory listing.</p>
          </li>
          <li>
            Real work in context
            <p>Your contribution shown inside a full wedding story.</p>
          </li>
          <li>
            Evergreen exposure
            <p>Tiles keep working for you over time.</p>
          </li>
          <li>
            Built for the ecosystem
            <p>Credits lift you and your collaborators together.</p>
          </li>
        </ul>
      </div>
      <Area>
        <h2>Spotlight feature: Supplier crediting</h2>
        <p>Fair, networked, and built to promote you</p>
        <ul>
          <li>Credits on every Tile show who did what across the NZ team</li>
          <li>Request to be credited when you're missed, and add context to describe your contribution</li>
          <li>Credited Tiles appear on each contributor's profile, multiplying reach</li>
          <li>Credits link straight to profiles, turning saved inspiration into enquiries</li>
          <li>Crediting data suggests compatible "dream teams" and better matches</li>
        </ul>
      </Area>
      {/* toggle cards */}
      <div>
        <h2>FAQs</h2>
        <details>
          <summary>"I don't have time for another platform."</summary>
          <p>
            Upload content in bulk (up to 10 images at a time) using photos you already have. Unlike social media that demands constant updates, your content
            stays relevant as long as you offer the services shown—helping you build a lasting digital presence that works for you, not the other way around.
          </p>
          <p>We're exploring an Instagram integration to automatically import your images and credits. Click here to register your interest.</p>
        </details>
        <details>
          <summary>"How is this different from Pinterest or Instagram?"</summary>
          <p>They inspire globally with no path to book. WeddingReady ties inspiration to local NZ suppliers you can hire.</p>
        </details>
      </div>
      {/* pricing cards */}
      <div>
        <h2>Pricing</h2>
        <div>
          <div>
            <p>Free</p>
            <p>Create supplier profile</p>
            <p>Upload Tiles</p>
            <p>Credit suppliers and request to be credited</p>
          </div>
          <div>
            <p>$20/month</p>
            <p>Create supplier profile</p>
            <p>Upload Tiles</p>
            <p>Credit suppliers and request to be credited</p>
            <p>Placement in directory</p>
          </div>
        </div>
      </div>
      {/* slider with quote, avatar, and name. fwd/back buttons to show more quotes. grid of company logos underneath*/}
      <div>
        <h2>Social proof</h2>
        <p>Supplier logos and quotes coming soon — early adopters are shaping the platform and securing first-mover visibility.</p>
      </div>
      {/* call to action */}
      <Area>
        <h2>Call to action</h2>
        <p>Be where couples are already dreaming — and ready to book.</p>
        <Button>Join as a supplier</Button>
        <p>You keep ownership of your images. By sharing, you allow WeddingReady to display and promote them so couples can discover your work.</p>
        <p>View full terms of use.</p>
        <p>Free to start. No card required.</p>
      </Area>
    </Section>
  )
}
