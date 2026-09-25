import React from 'react'

import type { SplitBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual, type VisualData } from '@/components/Illustrations'
import { withResi } from '@/components/Resi'

import { StepsScroller, type StepRow } from './StepsScroller'

/** Same scene, same layer: an illustration by key, an image by id. */
const sceneKey = (v: VisualData | null | undefined): string =>
  v?.type === 'image' ? `image:${typeof v.image === 'object' ? v.image?.id : v.image}` : `illustration:${v?.illustration || 'builder'}`

/** Split in steps mode: every scene rendered once here, the scroll behaviour in `StepsScroller`. */
export const SplitSteps: React.FC<Props & { locale?: Locale; isFirst?: boolean }> = ({ header, mediaSide, visual, points, links, locale, isFirst }) => {
  const list = (points || []).filter((p) => p.title)
  const keys = [sceneKey(visual as VisualData)]
  const scenes: React.ReactNode[] = [<Visual className="w-full" fallback="builder" key="section" locale={locale} visual={visual as VisualData} />]
  const steps: StepRow[] = list.map((p, i) => {
    const own = p.ownVisual && p.visual ? (p.visual as VisualData) : null
    let scene = 0
    if (own) {
      const key = sceneKey(own)
      scene = keys.indexOf(key)
      if (scene === -1) {
        keys.push(key)
        scenes.push(<Visual className="w-full" fallback="builder" key={key} locale={locale} visual={own} />)
        scene = scenes.length - 1
      }
    }
    return {
      id: p.id || String(i),
      title: withResi(p.title),
      titleText: p.title,
      text: p.text ? withResi(p.text) : null,
      scene,
      ownScene: own ? <Visual className="w-full" fallback="builder" locale={locale} visual={own} /> : null,
    }
  })
  return (
    <StepsScroller
      actions={<ActionRow links={links} />}
      header={<SectionHeading align="left" as={isFirst ? 'h1' : 'h2'} header={header} />}
      mediaLeft={mediaSide === 'left'}
      pinned={steps.some((s) => s.ownScene)}
      scenes={scenes}
      showTopScene={!steps[0]?.ownScene}
      steps={steps}
    />
  )
}
