import React from 'react'

import type { FaqBlock as Props } from '@/payload-types'

import RichText from '@/components/RichText'
import { SectionHeading } from '@/components/SectionHeading'
import { FaqClient, type FaqItemData } from './Client'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'

export const FaqBlock: React.FC<Props> = ({ header, items }) => {
  const list = (items || []).filter((i) => i.question && i.answer)
  if (list.length === 0) return null

  const data: FaqItemData[] = list.map((item, i) => ({
    id: item.id || String(i),
    question: item.question,
    answer: <RichText className="prose-sm md:prose-base" data={item.answer} enableGutter={false} />,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: lexicalToPlainText(item.answer) },
    })),
  }

  return (
    <div className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeading className="reveal lg:col-span-4 lg:sticky lg:top-28 lg:self-start" header={header} />
        <div className="lg:col-span-8">
          <FaqClient items={data} />
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
    </div>
  )
}
