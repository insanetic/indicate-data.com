import { describe, expect, it } from 'vitest'
import type { Field } from 'payload'

import { Split } from '@/blocks/Split/config'
import { Items } from '@/blocks/Items/config'

const named = (fields: Field[], name: string): any => {
  for (const f of fields as any[]) {
    if (f.name === name) return f
    if (f.fields) {
      const hit = named(f.fields, name)
      if (hit) return hit
    }
  }
}

describe('Split config', () => {
  it('has a point style switch defaulting to points', () => {
    const f = named(Split.fields, 'pointStyle')
    expect(f.type).toBe('select')
    expect(f.defaultValue).toBe('points')
    expect(f.options.map((o: any) => o.value)).toEqual(['points', 'steps'])
  })

  it('points get an own-scene checkbox and a visual shown only in steps mode', () => {
    const points = named(Split.fields, 'points')
    const own = named(points.fields, 'ownVisual')
    const visual = named(points.fields, 'visual')
    expect(own.type).toBe('checkbox')
    const steps = { blockData: { pointStyle: 'steps' } }
    const plain = { blockData: { pointStyle: 'points' } }
    expect(own.admin.condition({}, {}, steps)).toBe(true)
    expect(own.admin.condition({}, {}, plain)).toBe(false)
    expect(visual.admin.condition({}, { ownVisual: true }, steps)).toBe(true)
    expect(visual.admin.condition({}, { ownVisual: false }, steps)).toBe(false)
    expect(points.maxRows).toBe(4)
  })
})

describe('Items style picker', () => {
  const style = named(Items.fields, 'style')
  const values = (siblingStyle?: string) =>
    style.filterOptions({ options: style.options, siblingData: { style: siblingStyle }, data: {}, req: {} }).map((o: any) => o.value)

  it('offers neither cards nor steps for new rows', () => {
    expect(values(undefined)).toEqual(['points', 'stats'])
  })

  it('keeps the current value selectable on existing rows', () => {
    expect(values('steps')).toContain('steps')
    expect(values('cards')).toContain('cards')
  })
})
