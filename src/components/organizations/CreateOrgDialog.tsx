import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateOrganization } from '@/hooks/useOrganizations'
import { createOrgSchema, type CreateOrgFormData } from '@/lib/validations'

export function CreateOrgDialog() {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useCreateOrganization()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { type: 'business' },
  })

  const selectedType = watch('type')

  async function onSubmit(data: CreateOrgFormData) {
    await mutateAsync(data)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Acme Corp" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-[--color-destructive]">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="nonprofit">Nonprofit</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-[--color-destructive]">{errors.type.message}</p>
            )}
          </div>

          {/* Conditional: School District */}
          {selectedType === 'school' && (
            <div className="space-y-1.5">
              <Label htmlFor="school_district">School District</Label>
              <Input
                id="school_district"
                placeholder="e.g. Los Angeles USD"
                {...register('school_district')}
              />
              {errors.school_district && (
                <p className="text-xs text-[--color-destructive]">
                  {errors.school_district.message}
                </p>
              )}
            </div>
          )}

          {/* Conditional: Tax ID */}
          {selectedType === 'nonprofit' && (
            <div className="space-y-1.5">
              <Label htmlFor="tax_id">Tax ID (EIN)</Label>
              <Input id="tax_id" placeholder="e.g. 12-3456789" {...register('tax_id')} />
              {errors.tax_id && (
                <p className="text-xs text-[--color-destructive]">{errors.tax_id.message}</p>
              )}
            </div>
          )}

          {/* Conditional: Industry */}
          {selectedType === 'business' && (
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g. Technology, Healthcare"
                {...register('industry')}
              />
              {errors.industry && (
                <p className="text-xs text-[--color-destructive]">{errors.industry.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
