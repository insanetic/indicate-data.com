import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Indicate Data verbindet PMS, Buchungskanäle und Marketing in einem Dashboard. Ein KI-Agent beantwortet Fragen zu Auslastung, ADR und RevPAR in einfachen Worten.',
  images: [
    {
      url: `${getServerSideURL()}/og-default.png`,
    },
  ],
  siteName: 'Indicate Data',
  title: 'Indicate Data',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
