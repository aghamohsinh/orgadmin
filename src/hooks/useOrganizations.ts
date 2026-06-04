import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { CreateOrgPayload, Organization } from '@/types'

export const orgKeys = {
  all: ['organizations'] as const,
  list: () => [...orgKeys.all, 'list'] as const,
  detail: (id: string) => [...orgKeys.all, 'detail', id] as const,
}

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.list(),
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, organization_members(count)')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((org) => ({
        ...org,
        member_count: (org.organization_members as unknown as [{ count: number }])[0]?.count ?? 0,
      }))
    },
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: async (): Promise<Organization | null> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, organization_members(count)')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      return {
        ...data,
        member_count: (data.organization_members as unknown as [{ count: number }])[0]?.count ?? 0,
      }
    },
    enabled: !!id,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateOrgPayload) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: payload.name,
          type: payload.type,
          created_by: user.id,
          school_district: payload.school_district ?? null,
          tax_id: payload.tax_id ?? null,
          industry: payload.industry ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.list() })
      toast.success(`"${(data as { name: string }).name}" created successfully`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create organization')
    },
  })
}
