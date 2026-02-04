'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Home, User, Briefcase, FileText, Mail, Sparkles, ChevronDown, Camera } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: User },
  {
    name: 'Work',
    href: '/work',
    icon: Briefcase,
    dropdown: [
      { name: 'All Projects', href: '/work' },
      { name: 'Research', href: '/work?category=research' },
      { name: 'Technology', href: '/work?category=technology' },
      { name: 'Analysis', href: '/work?category=analysis' },
    ]
  },
  {
    name: 'Articles',
    href: '/articles',
    icon: FileText,
    dropdown: [
      { name: 'All Articles', href: '/articles' },
      { name: 'Research Papers', href: '/articles?category=research' },
      { name: 'Blog Posts', href: '/articles?category=blog' },
      { name: 'Technical Guides', href: '/articles?category=technical' },
    ]
  },
  {
    name: 'Fashion',
    href: '/fashion',
    icon: Camera,
    dropdown: [
      { name: 'All Work', href: '/fashion' },
      { name: 'Runway', href: '/fashion?category=runway' },
      { name: 'Editorial', href: '/fashion?category=editorial' },
      { name: 'Commercial', href: '/fashion?category=commercial' },
      { name: 'Portfolio', href: '/fashion?category=portfolio' },
    ]
  },
  { name: 'Contact', href: '/contact', icon: Mail },
]
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'glass-panel border-b border-white/10 py-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
            : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 group"
              onMouseEnter={() => setHoveredItem('logo')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#00f0ff] rounded-full blur-[20px] opacity-20" />
                <Sparkles className="w-8 h-8 text-[#00f0ff] relative z-10 group-hover:scale-110 transition-transform" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7000ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  M-AbbasLab
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase">
                  Personal Operating Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                const hasDropdown = item.dropdown

                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => {
                      setHoveredItem(item.name)
                      if (hasDropdown) setOpenDropdown(item.name)
                    }}
                    onMouseLeave={() => {
                      setHoveredItem(null)
                      if (hasDropdown) setOpenDropdown(null)
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`relative px-5 py-2.5 rounded-xl group transition-all duration-300 flex items-center space-x-2 ${active
                          ? 'text-[#00f0ff]'
                          : 'text-gray-300 hover:text-white'
                        }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${active ? 'text-[#00f0ff] drop-shadow-[0_0_5px_#00f0ff]' : 'text-gray-400 group-hover:text-[#00f0ff]'
                        }`} aria-hidden="true" />
                      <span className={`font-medium transition-colors ${active ? 'text-[#00f0ff]' : 'group-hover:text-white'
                        }`}>
                        {item.name}
                      </span>
                      {hasDropdown && (
                        <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.name ? 'rotate-180 text-[#00f0ff]' : 'text-gray-500'
                          }`} aria-hidden="true" />
                      )}

                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_#00f0ff]"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {/* Hover indicator (background) */}
                      {hoveredItem === item.name && !active && (
                        <motion.div
                          layoutId="navbar-hover"
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>

                    {/* Dropdown Menu */}
                    {hasDropdown && openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-4 w-56 glass-panel rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                      >
                        <div className="py-2">
                          {item.dropdown!.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors group/item"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className="text-gray-300 group-hover/item:text-[#00f0ff] transition-colors text-sm">
                                {dropdownItem.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <a
                  href="/contact"
                  className="ml-4 px-6 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold tracking-wide rounded-xl shadow-[0_0_15px_rgba(112,0,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  Get in Touch
                </a>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-24 left-4 right-4 z-40 glass-panel rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden bg-[#030014]/90"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                const hasDropdown = item.dropdown
                const dropdownOpen = mobileOpenDropdown === item.name

                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl w-full transition-colors ${active
                            ? 'bg-blue-500/10 text-[#00f0ff] border border-[#00f0ff]/30'
                            : 'hover:bg-white/5 text-gray-300'
                          }`}
                        onClick={() => {
                          if (!hasDropdown) setIsOpen(false)
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                      {hasDropdown && (
                        <button
                          onClick={() =>
                            setMobileOpenDropdown(
                              dropdownOpen ? null : item.name
                            )
                          }
                          className="p-3 ml-2 text-gray-400 hover:text-white"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''
                            }`} />
                        </button>
                      )}
                    </div>
                    {hasDropdown && dropdownOpen && (
                      <div className="ml-8 mt-1 space-y-1 border-l border-white/10 pl-4 my-2">
                        {item.dropdown!.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-[#00f0ff] transition-colors text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <a
                href="/contact"
                className="block mt-6 px-4 py-3.5 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold tracking-wide rounded-xl text-center shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                Get in Touch
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}