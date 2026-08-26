import type { Metadata } from 'next'
import { getLiveConfig } from '@/lib/dbConfig'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Mohammed Abbas',
  description: 'Building intelligent systems that combine full-stack development, data science, and strategic thinking. Full-stack engineer, data scientist, and entrepreneur.',
  openGraph: {
    title: 'Mohammed Abbas — Full-Stack Engineer & Data Scientist',
    description: 'Building intelligent systems that combine full-stack development, data science, and strategic thinking.',
    url: 'https://www.mohammedabbas.tech/about',
  },
}

export default async function AboutPage() {
  const config: any = await getLiveConfig()
  return <AboutClient config={config} />
}
