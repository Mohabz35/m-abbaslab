import type { Metadata } from 'next'
import { Bebas_Neue, Manrope } from 'next/font/google'
import './kipawa.css'

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-kipawa-display',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-kipawa-body',
})

export const metadata: Metadata = {
  title: 'Kipawa Afrika Media | Invest In Talent',
  description:
    'A futuristic creative portfolio for Kipawa Afrika Media. Rooted in Kenya, branching across Africa.',
}

const milestones = [
  { year: '2019', detail: 'Founded in Nairobi' },
  { year: '2020', detail: 'Jitambulishe Show launched' },
  { year: '2023-2024', detail: 'Music, Dance, and Modelling expansion' },
  { year: '2025', detail: 'County Got Talent Tour, AFRIMELO, KAM Models Academy' },
  { year: '2026+', detail: 'Pan-African rollout in motion' },
]

const pillars = [
  {
    title: 'Music Division',
    unit: 'AFRIMELO',
    tagline: 'African sound. Global distribution. Royalties that stay on the continent.',
    points: ['A&R and production', 'Mixing and mastering', 'Video direction and artist management'],
  },
  {
    title: 'Modelling Division',
    unit: 'KAM Models Academy',
    tagline: 'The runway runs through the villages first.',
    points: ['County scouting and training', 'Pageant and fashion show production', 'Brand campaign casting'],
  },
  {
    title: 'Dance Division',
    unit: 'KAM Dancers',
    tagline: 'Every dance tells an African story.',
    points: ['Choreography and dance crews', 'Music video backing', 'Live performance and youth outreach'],
  },
  {
    title: 'Comedy & MC',
    unit: 'Talent Development',
    tagline: 'From open mics to global specials.',
    points: ['Stand-up development', 'Event hosting', 'Sketch content production'],
  },
  {
    title: 'Creative & Technical',
    unit: 'Design, AV, Web',
    tagline: 'Brand systems that move from idea to audience.',
    points: ['Graphic design and branding', 'Audio and visual production', 'Web, apps, marketing, distribution'],
  },
  {
    title: 'Live Events',
    unit: 'Jitambulishe Show',
    tagline: 'The show that refused to die.',
    points: ['Event production and venue partnerships', 'County tour logistics', 'Talent showcase curation'],
  },
]

const stats = [
  { value: '6+', label: 'Years Operating' },
  { value: '8+', label: 'Counties Activated' },
  { value: '1,000+', label: 'Talents Discovered' },
  { value: '50+', label: 'Live Events Produced' },
  { value: '100,000+', label: 'Social Reach' },
  { value: '20+', label: 'Brand Partners' },
]

const counties = ['Kitui', 'Kilifi', 'Kwale', 'Machakos', 'Nairobi', 'Nakuru', 'Kiambu', 'Makueni']

export default function KipawaAfrikaPage() {
  return (
    <div className={`kipawa-root ${bebas.variable} ${manrope.variable}`}>
      <div className="kipawa-noise" aria-hidden />
      <header className="kipawa-nav reveal" style={{ animationDelay: '0.05s' }}>
        <p className="nav-brand">Kipawa Afrika Media</p>
        <nav>
          <a href="#origin">Origin</a>
          <a href="#pillars">Pillars</a>
          <a href="#movement">Movement</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="kipawa-hero reveal" style={{ animationDelay: '0.12s' }}>
        <p className="eyebrow">Rooted in Kenya. Branching Across Africa.</p>
        <h1>
          THE HEADQUARTERS OF THE <span>AFRICAN TALENT REVOLUTION</span>
        </h1>
        <p className="lead">
          Founded on 5 September 2019 in Nairobi by Duncan Musyoka Wambua (MC Losfou Music), Kipawa
          Afrika Media has grown into a complete talent ecosystem across music, modelling, dance,
          comedy, design, and live events.
        </p>
        <div className="hero-cta-row">
          <a href="#membership" className="btn-primary">
            Join The Movement
          </a>
          <a href="#partners" className="btn-ghost">
            View Partners
          </a>
        </div>
        <p className="hash">#InvestInTalentArtPays</p>
      </section>

      <section id="origin" className="kipawa-section reveal" style={{ animationDelay: '0.2s' }}>
        <h2>Origin Story</h2>
        <p>
          Started in a bedroom with a phone and a mission: African talent should not have to leave
          Africa to be valued. From pandemic-era digital shows to county tours and academies, the
          movement now scales by design.
        </p>
        <div className="timeline-grid">
          {milestones.map((item) => (
            <article key={item.year} className="timeline-card">
              <p className="year">{item.year}</p>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pillars" className="kipawa-section reveal" style={{ animationDelay: '0.28s' }}>
        <h2>The Pillars</h2>
        <p>We are not one thing. We are everything talent needs.</p>
        <div className="pillar-grid">
          {pillars.map((pillar, i) => (
            <article key={pillar.title} className="hex-card" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
              <p className="unit">{pillar.unit}</p>
              <h3>{pillar.title}</h3>
              <p className="tagline">{pillar.tagline}</p>
              <ul>
                {pillar.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="movement" className="kipawa-section reveal" style={{ animationDelay: '0.36s' }}>
        <h2>County to County. Border to Border.</h2>
        <p>
          First deployment: 9 August 2025. One county every month until all are reached, then Uganda,
          Tanzania, Rwanda, and DRC.
        </p>
        <div className="map-panel">
          <div className="pulse-grid" aria-hidden />
          <div className="county-tags">
            {counties.map((county) => (
              <span key={county}>{county}</span>
            ))}
          </div>
          <p className="map-copy">
            Talent is not concentrated in the capital. It is scattered across the soil, and Kipawa is
            building the discovery infrastructure to harvest it.
          </p>
        </div>
      </section>

      <section className="kipawa-section reveal" style={{ animationDelay: '0.44s' }}>
        <h2>The Ecosystem</h2>
        <div className="ecosystem-grid">
          <article>
            <h3>Social Media Army</h3>
            <p>Facebook, Instagram, TikTok, YouTube, LinkedIn, WhatsApp channels and groups.</p>
          </article>
          <article>
            <h3>Talent Pipeline</h3>
            <p>County tours to academy training to professional placement.</p>
          </article>
          <article className="center-node">
            <h3>Kipawa Afrika Media</h3>
            <p>The mothership connecting discovery, production, branding, and monetization.</p>
          </article>
          <article>
            <h3>Commercial Arm</h3>
            <p>Merchandise, events, endorsements, and sponsor-ready storytelling.</p>
          </article>
          <article>
            <h3>Distribution Network</h3>
            <p>AFRIMELO, KAM Models, KAM Dancers, and East African creative partnerships.</p>
          </article>
        </div>
      </section>

      <section className="kipawa-section reveal" style={{ animationDelay: '0.52s' }}>
        <h2>The Numbers</h2>
        <div className="stats-grid">
          {stats.map((item) => (
            <article key={item.label} className="stat-card">
              <p className="stat-value">{item.value}</p>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="membership" className="kipawa-section reveal" style={{ animationDelay: '0.6s' }}>
        <h2>Join The Movement</h2>
        <p>
          Musician, dancer, model, comedian, MC, designer, or creator. If you have talent, Kipawa has
          a department. If you do not know your talent yet, Kipawa helps you discover it.
        </p>
        <div className="membership-panel">
          <p>Membership Inquiries: kipawaafrika@gmail.com</p>
          <p>Hotline: +254 728 319 793 | +254 728 404 072 | +254 715 882 715</p>
        </div>
      </section>

      <section id="partners" className="kipawa-section reveal" style={{ animationDelay: '0.68s' }}>
        <h2>Partners</h2>
        <div className="partners-grid">
          <article>
            <h3>Music & Production</h3>
            <p>Coin Sweet Beats, Bonita Drum Beats, Wakeco Records, CB Media.</p>
          </article>
          <article>
            <h3>Design & Branding</h3>
            <p>Bliqs Media, Driq Events, Inno Boss, Joju Graphic Designs, Hakkiem Creations.</p>
          </article>
          <article>
            <h3>Tech & Digital</h3>
            <p>Jeinet Holdings.</p>
          </article>
          <article>
            <h3>Venues & Events</h3>
            <p>Screenshot Lounge (Mtwapa), Texas Lounge (Kwale), county venue network.</p>
          </article>
        </div>
      </section>

      <section id="contact" className="kipawa-section reveal" style={{ animationDelay: '0.76s' }}>
        <h2>Contact</h2>
        <div className="contact-grid">
          <article>
            <p className="label">Main Email</p>
            <p>kipawaafrika@gmail.com</p>
          </article>
          <article>
            <p className="label">Music Division</p>
            <p>afrimelo5126@gmail.com</p>
          </article>
          <article>
            <p className="label">KAM Models Academy</p>
            <p>kammodelsacademy@gmail.com</p>
          </article>
          <article>
            <p className="label">Hotlines</p>
            <p>+254 728 319 793 | +254 728 404 072 | +254 715 882 715</p>
          </article>
        </div>
      </section>

      <section className="kipawa-closing reveal" style={{ animationDelay: '0.84s' }}>
        <p>
          This is not a gallery. It is a prospectus. Invest in human beings. Invest in talent. Art
          pays.
        </p>
      </section>
    </div>
  )
}
