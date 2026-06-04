import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Mail, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrgTypeBadge } from '@/components/organizations/OrgTypeBadge'
import { InviteMemberDialog } from '@/components/members/InviteMemberDialog'
import { useOrganization } from '@/hooks/useOrganizations'
import { useMembers } from '@/hooks/useMembers'
import type { MemberStatus } from '@/types'

function StatusBadge({ status }: { status: MemberStatus }) {
  return <Badge variant={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

export function OrgDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: org, isLoading: orgLoading, error: orgError } = useOrganization(id ?? '')
  const { data: members, isLoading: membersLoading } = useMembers(id ?? '')

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 animate-pulse rounded bg-[--color-muted]" />
        <div className="h-32 animate-pulse rounded-lg bg-[--color-muted]" />
      </div>
    )
  }

  if (orgError || !org) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="rounded-md bg-[--color-destructive]/10 px-4 py-3 text-sm text-[--color-destructive]">
          Organization not found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            All organizations
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[--color-foreground]">{org.name}</h1>
              <OrgTypeBadge type={org.type} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-[--color-muted-foreground]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created {new Date(org.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {org.member_count ?? 0} member{org.member_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <InviteMemberDialog organizationId={org.id} />
        </div>
      </div>

      {/* Type-specific info card */}
      {(org.school_district || org.tax_id || org.industry) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[--color-muted-foreground]">
              Organization details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.type === 'school' && org.school_district && (
              <p className="text-sm">
                <span className="font-medium">School District:</span> {org.school_district}
              </p>
            )}
            {org.type === 'nonprofit' && org.tax_id && (
              <p className="text-sm">
                <span className="font-medium">Tax ID (EIN):</span> {org.tax_id}
              </p>
            )}
            {org.type === 'business' && org.industry && (
              <p className="text-sm">
                <span className="font-medium">Industry:</span> {org.industry}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-[--color-foreground]">Members</h2>

        {membersLoading && (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-[--color-muted]" />
            ))}
          </div>
        )}

        {!membersLoading && (!members || members.length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Mail className="mb-3 h-10 w-10 text-[--color-muted-foreground]" />
            <p className="text-sm text-[--color-muted-foreground]">
              No members yet. Invite someone to get started.
            </p>
          </div>
        )}

        {!membersLoading && members && members.length > 0 && (
          <Card>
            <div className="divide-y divide-[--color-border]">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[--color-foreground]">
                      {member.email}
                    </p>
                    <p className="text-xs text-[--color-muted-foreground]">
                      Invited {new Date(member.invited_at).toLocaleDateString()} · {member.role}
                    </p>
                  </div>
                  <StatusBadge status={member.status} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
