import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Calendar, Search, Users, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OrgTypeBadge } from '@/components/organizations/OrgTypeBadge'
import { CreateOrgDialog } from '@/components/organizations/CreateOrgDialog'
import { useOrganizations } from '@/hooks/useOrganizations'
import type { OrgType, Organization } from '@/types'

const TYPE_FILTERS: { label: string; value: OrgType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Business', value: 'business' },
  { label: 'School', value: 'school' },
  { label: 'Nonprofit', value: 'nonprofit' },
]

function OrgCard({ org }: { org: Organization }) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/dashboard/orgs/${org.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-[--color-foreground]">{org.name}</h3>
          </div>
          <OrgTypeBadge type={org.type} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[--color-muted-foreground]">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {org.member_count ?? 0} member{org.member_count !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(org.created_at).toLocaleDateString()}
          </span>
        </div>
        {org.type === 'school' && org.school_district && (
          <p className="mt-2 text-xs text-[--color-muted-foreground]">
            District: {org.school_district}
          </p>
        )}
        {org.type === 'nonprofit' && org.tax_id && (
          <p className="mt-2 text-xs text-[--color-muted-foreground]">EIN: {org.tax_id}</p>
        )}
        {org.type === 'business' && org.industry && (
          <Badge variant="outline" className="mt-2 text-xs">
            {org.industry}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { data: orgs, isLoading, error } = useOrganizations()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<OrgType | 'all'>('all')

  const filtered = useMemo(() => {
    if (!orgs) return []
    return orgs.filter((org) => {
      const matchesType = typeFilter === 'all' || org.type === typeFilter
      const matchesSearch =
        search.trim() === '' ||
        org.name.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [orgs, search, typeFilter])

  const hasActiveFilter = search.trim() !== '' || typeFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[--color-foreground]">Organizations</h1>
          <p className="text-sm text-[--color-muted-foreground]">
            Manage your organizations and their members
          </p>
        </div>
        <CreateOrgDialog />
      </div>

      {/* Search + filter bar */}
      {!isLoading && !error && (orgs?.length ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-muted-foreground]" />
            <Input
              placeholder="Search organizations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-muted-foreground] hover:text-[--color-foreground]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1">
            {TYPE_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={typeFilter === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 w-3/4 rounded bg-[--color-muted]" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-1/2 rounded bg-[--color-muted]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-[--color-destructive]/10 px-4 py-3 text-sm text-[--color-destructive]">
          Failed to load organizations: {error.message}
        </div>
      )}

      {/* Empty: no orgs at all */}
      {!isLoading && !error && orgs?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-[--color-muted-foreground]" />
          <h3 className="text-lg font-medium text-[--color-foreground]">No organizations yet</h3>
          <p className="mt-1 text-sm text-[--color-muted-foreground]">
            Create your first organization to get started.
          </p>
        </div>
      )}

      {/* Empty: filtered to zero */}
      {!isLoading && !error && orgs && orgs.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center">
          <Search className="mb-3 h-10 w-10 text-[--color-muted-foreground]" />
          <p className="text-sm text-[--color-muted-foreground]">
            No organizations match your search.
          </p>
          {hasActiveFilter && (
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => { setSearch(''); setTypeFilter('all') }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  )
}
