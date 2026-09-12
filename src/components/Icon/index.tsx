import {
  BarChart3,
  Bed,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  Code2,
  Database,
  Euro,
  Eye,
  Globe,
  Hotel,
  Layers,
  Lock,
  MessageSquare,
  Palette,
  Percent,
  Plug,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'
import type { IconKey } from './options'

const iconMap: Record<IconKey, LucideIcon> = {
  chart: BarChart3,
  sparkles: Sparkles,
  message: MessageSquare,
  plug: Plug,
  database: Database,
  layers: Layers,
  users: Users,
  shield: Shield,
  lock: Lock,
  clock: Clock,
  calendar: Calendar,
  target: Target,
  trending: TrendingUp,
  bell: Bell,
  globe: Globe,
  building: Hotel,
  buildings: Building2,
  briefcase: Briefcase,
  code: Code2,
  check: Check,
  euro: Euro,
  percent: Percent,
  bed: Bed,
  upload: Upload,
  palette: Palette,
  eye: Eye,
  zap: Zap,
  search: Search,
}

type Props = {
  name?: IconKey | string | null
  className?: string
  size?: number
}

/** One icon set (Lucide), one stroke width, always decorative. */
export const Icon: React.FC<Props> = ({ name, className, size = 20 }) => {
  if (!name || !(name in iconMap)) return null
  const Cmp = iconMap[name as IconKey]
  return <Cmp aria-hidden="true" className={cn('shrink-0', className)} size={size} strokeWidth={1.75} />
}

/** Icon inside a soft tinted square, used on feature rows and cards. */
export const IconTile: React.FC<Props & { tone?: 'blue' | 'yellow' | 'coral' | 'neutral' }> = ({
  name,
  className,
  tone = 'blue',
}) => {
  const tones = {
    blue: 'bg-brand-blue-soft text-brand-blue-deep',
    yellow: 'bg-brand-yellow-soft text-ink',
    coral: 'bg-brand-coral-soft text-brand-coral',
    neutral: 'bg-surface-2 text-ink',
  }
  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-card-inner',
        tones[tone],
        className,
      )}
    >
      <Icon name={name} size={20} />
    </span>
  )
}
