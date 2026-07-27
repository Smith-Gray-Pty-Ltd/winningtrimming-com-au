'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

/**
 * Header-only contrast mode. This is NOT a site theme and is not user-toggleable.
 * Pages with a dark hero set the header to 'dark' so its text/logo stay legible
 * over the imagery. There is exactly one site theme (see globals.css).
 */
export type HeaderThemeMode = 'dark' | 'light'

export interface ContextType {
  headerTheme?: HeaderThemeMode | null
  setHeaderTheme: (theme: HeaderThemeMode | null) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<HeaderThemeMode | undefined | null>(undefined)

  const setHeaderTheme = useCallback((themeToSet: HeaderThemeMode | null) => {
    setThemeState(themeToSet)
  }, [])

  return (
    <HeaderThemeContext.Provider value={{ headerTheme, setHeaderTheme }}>
      {children}
    </HeaderThemeContext.Provider>
  )
}

export const useHeaderTheme = (): ContextType => useContext(HeaderThemeContext)
