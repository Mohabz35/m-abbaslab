import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useNavbar() {
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

    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.navbar-dropdown')) {
        setOpenDropdown(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
        setIsOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMobileMenu = () => {
    setIsOpen(false)
  }

  const toggleMobileDropdown = (itemName: string) => {
    setMobileOpenDropdown(
      mobileOpenDropdown === itemName ? null : itemName
    )
  }

  return {
    isOpen,
    scrolled,
    hoveredItem,
    openDropdown,
    mobileOpenDropdown,
    pathname,
    setHoveredItem,
    setOpenDropdown,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileDropdown,
    isActive,
  }
}
