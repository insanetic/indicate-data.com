'use client'

import React, { createContext, use } from 'react'

import type { ThemeContextType } from './types'

/**
 * The marketing site has one look (light), with dark sections handled per `<Section>`.
 * This provider keeps the starter template's `useTheme` API alive for legacy components
 * but never touches `<html data-theme>`.
 */
const ThemeContext = createContext<ThemeContextType>({
  setTheme: () => null,
  theme: 'light',
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext value={{ setTheme: () => null, theme: 'light' }}>{children}</ThemeContext>
)

export const useTheme = (): ThemeContextType => use(ThemeContext)
