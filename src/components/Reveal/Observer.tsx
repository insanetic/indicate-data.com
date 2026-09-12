'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const SELECTOR = '.reveal, .reveal-stagger > *'

/**
 * Plays the `.reveal` entrance once per element. Mounted once in the layout; it watches the
 * whole document so server-rendered blocks need nothing but the class. Elements already in
 * view on arrival are shown immediately, later ones when they cross the lower 12 % of the
 * viewport. Under reduced motion the stylesheet never hides anything, so this is a no-op.
 */
export const RevealObserver: React.FC = () => {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-in', '')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    const observe = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (!el.hasAttribute('data-in')) io.observe(el)
      })
    }
    observe(document)

    // Blocks added later (route changes, live preview) join the same observer.
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(SELECTOR)) io.observe(node)
            observe(node)
          }
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
