import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { InviteMemberPayload, OrganizationMember } from '@/types'

export const memberKeys = {
  all: ['members'] as const,
  byOrg: (orgId: string) => [...memberKeys.all, 'org', orgId] as const,
}

export function useMembers(orgId: string) {
  return useQuery({
    queryKey: memberKeys.byOrg(orgId),
    queryFn: async (): Promise<OrganizationMember[]> => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .order('invited_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!orgId,
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: InviteMemberPayload) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const response = await fetch(`${supabaseUrl}/functions/v1/invite-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { error?: string; data?: OrganizationMember }

      if (!response.ok) {
        throw new Error((result as { error?: string }).error ?? 'Failed to invite member')
      }

      return result.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.byOrg(variables.organization_id) })
      toast.success(`Invitation sent to ${variables.email}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation')
    },
  })
}
