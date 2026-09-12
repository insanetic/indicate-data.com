'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/providers/Locale'
import { getDictionary } from '@/i18n/dictionaries'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const locale = useLocale()
  const dict = getDictionary(locale)

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/${locale}/search${debouncedValue ? `?q=${encodeURIComponent(debouncedValue)}` : ''}`)
  }, [debouncedValue, locale, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          {dict.search}
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={dict.searchPlaceholder}
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
