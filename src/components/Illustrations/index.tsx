import React from 'react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

import { AgentIllustration } from './Agent'
import { AgentChatIllustration } from './AgentChat'
import { CollectionsIllustration } from './Collections'
import { DimensionsIllustration } from './Dimensions'
import { SemanticLayerIllustration } from './SemanticLayer'
import { GovernanceIllustration } from './Governance'
import { KpiStudioIllustration } from './KpiStudio'
import { McpIllustration } from './Mcp'
import { ResiIllustration } from './Resi'
import { SyncIllustration } from './Sync'
import { TemplatesIllustration } from './Templates'
import { AlertsIllustration } from './Alerts'
import { BuilderIllustration } from './Builder'
import { CampaignsIllustration } from './Campaigns'
import { ComparisonIllustration } from './Comparison'
import { DashboardIllustration } from './Dashboard'
import { FlyingKpisIllustration } from './FlyingKpis'
import { IntegrationsIllustration } from './Integrations'
import { PortfolioIllustration } from './Portfolio'
import { SourcesIllustration } from './Sources'
import { TeamIllustration } from './Team'
import { HeroStage } from '@/blocks/Hero/Stage'
import type { IllustrationKey } from './registry'

import type { Locale } from '@/i18n/config'

export type IllustrationProps = { className?: string; locale?: Locale | null }

export const illustrations: Record<IllustrationKey, React.FC<IllustrationProps>> = {
  stage: HeroStage,
  dashboard: DashboardIllustration,
  agent: AgentIllustration,
  comparison: ComparisonIllustration,
  sources: SourcesIllustration,
  team: TeamIllustration,
  integrations: IntegrationsIllustration,
  alerts: AlertsIllustration,
  builder: BuilderIllustration,
  flyingKpis: FlyingKpisIllustration,
  portfolio: PortfolioIllustration,
  campaigns: CampaignsIllustration,
  agentChat: AgentChatIllustration,
  mcp: McpIllustration,
  resi: ResiIllustration,
  kpiStudio: KpiStudioIllustration,
  templates: TemplatesIllustration,
  governance: GovernanceIllustration,
  sync: SyncIllustration,
  semanticLayer: SemanticLayerIllustration,
  dimensions: DimensionsIllustration,
  collections: CollectionsIllustration,
}

export type VisualData = {
  type?: 'illustration' | 'image' | null
  illustration?: IllustrationKey | string | null
  image?: MediaType | number | null
}

/** Renders the illustration chosen in the CMS, or the uploaded image when one is set. */
export const Visual: React.FC<{
  visual?: VisualData | null
  fallback?: IllustrationKey
  className?: string
  locale?: Locale | null
}> = ({ visual, fallback = 'dashboard', className, locale }) => {
  if (visual?.type === 'image' && visual.image && typeof visual.image === 'object') {
    return (
      <Media
        resource={visual.image}
        imgClassName={cn('rounded-card w-full h-auto', className)}
        htmlElement={null}
      />
    )
  }
  const key = (visual?.illustration as IllustrationKey) in illustrations
    ? (visual?.illustration as IllustrationKey)
    : fallback
  const Cmp = illustrations[key]
  return <Cmp className={className} locale={locale} />
}
