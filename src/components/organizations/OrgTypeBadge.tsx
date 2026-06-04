import type { OrgType } from '@/types'
import { Badge } from '@/components/ui/badge'

const labels: Record<OrgType, string> = {
  school: 'School',
  nonprofit: 'Nonprofit',
  business: 'Business',
}

export function OrgTypeBadge({ type }: { type: OrgType }) {
  return <Badge variant={type}>{labels[type]}</Badge>
}
