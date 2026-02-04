// lib/types.ts
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  github_url: string | null;
  live_url: string | null;
  technologies: string[];
  category: string;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string;
  read_time: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FashionWork {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  client: string | null;
  category: string;
  images: string[];
  location: string | null;
  date: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
}

export type ContentType = 'project' | 'article' | 'fashion';

// Component data interfaces
export interface FeaturedProject {
  title: string;
  description: string;
  tags: string[];
  category: string;
  link: string;
  github: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'indigo';
}

export interface StatItem {
  icon: any; // Lucide icon component
  value: string;
  label: string;
  suffix: string;
}

export interface FeatureItem {
  icon: any; // Lucide icon component
  title: string;
  desc: string;
}

export interface NavItem {
  name: string;
  href: string;
  icon: any; // Lucide icon component
  dropdown?: {
    name: string;
    href: string;
  }[];
}
