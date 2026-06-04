export type OrgType = 'school' | 'nonprofit' | 'business'
export type MemberStatus = 'invited' | 'active'
export type MemberRole = 'admin' | 'member'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: OrgType
  created_by: string
  created_at: string
  // type-specific fields
  school_district: string | null
  tax_id: string | null
  industry: string | null
  // computed
  member_count?: number
}

export interface OrganizationMember {
  id: string
  organization_id: string
  email: string
  user_id: string | null
  status: MemberStatus
  role: MemberRole
  invited_at: string
  joined_at: string | null
}

export interface CreateOrgPayload {
  name: string
  type: OrgType
  school_district?: string
  tax_id?: string
  industry?: string
}

export interface InviteMemberPayload {
  organization_id: string
  email: string
}
