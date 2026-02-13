import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserCog,
  Pencil,
  X,
  Loader2,
  Clock,
  Building2,
  Globe,
  MapPin,
  Users,
  Tag,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useProviderProfile, useProviderSubmission, useUpdateProviderProfile, useTspEdits } from '@/hooks/use-provider'
import { cn } from '@/lib/utils'
import type { TspSubmission, StartupSubmission } from '@/types/provider'

const editSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  company_size: z.string().min(1, 'Company size is required'),
  website: z.string().url('Must be a valid URL').or(z.literal('')).nullable(),
  about_text: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_email: z.string().email('Must be a valid email').or(z.literal('')).nullable().optional(),
  contact_phone: z.string().nullable().optional(),
})

type EditFormData = z.infer<typeof editSchema>

interface ProfileTabProps {
  profileId: string
}

export function ProfileTab({ profileId }: ProfileTabProps) {
  const { data: profile } = useProviderProfile()
  const { data: submission } = useProviderSubmission(profileId)
  const { data: edits } = useTspEdits()
  const updateProfile = useUpdateProviderProfile()
  const [editing, setEditing] = useState(false)

  const pendingEdits = edits?.filter((e) => e.status === 'pending') ?? []
  const hasPendingEdits = pendingEdits.length > 0

  const tspSubmission = submission as TspSubmission | null
  const startupSubmission = submission as StartupSubmission | null
  const isTsp = profile?.category === 'tsp'

  if (!profile) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
          <UserCog className="w-6 h-6 text-enterprise-400" />
        </div>
        <p className="text-sm text-enterprise-500">No profile found.</p>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-center" richColors />

      {/* Pending edits banner */}
      {hasPendingEdits && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              {pendingEdits.length} edit request{pendingEdits.length !== 1 ? 's' : ''} pending review
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Changes will go live after admin approval. Your current profile remains unchanged.
            </p>
          </div>
        </div>
      )}

      {editing ? (
        <EditMode
          profile={profile}
          submission={submission ?? null}
          isTsp={isTsp}
          onCancel={() => setEditing(false)}
          onSave={(diff) => {
            if (!submission) return
            // For TSP, tsp_id = submission.id; for startup, same pattern
            updateProfile.mutate(
              { tspId: submission.id, payload: diff },
              {
                onSuccess: () => {
                  toast.success('Edit request submitted for review')
                  setEditing(false)
                },
                onError: (error) => {
                  toast.error(error.message || 'Failed to submit edit request')
                },
              },
            )
          }}
          isSaving={updateProfile.isPending}
        />
      ) : (
        <ViewMode
          profile={profile}
          submission={submission ?? null}
          isTsp={isTsp}
          tspSubmission={tspSubmission}
          startupSubmission={startupSubmission}
          onEdit={() => setEditing(true)}
          isApproved={profile.status === 'approved'}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// View mode
// ---------------------------------------------------------------------------

function ViewMode({
  profile,
  submission,
  isTsp,
  tspSubmission,
  startupSubmission,
  onEdit,
  isApproved,
}: {
  profile: NonNullable<ReturnType<typeof useProviderProfile>['data']>
  submission: TspSubmission | StartupSubmission | null
  isTsp: boolean
  tspSubmission: TspSubmission | null
  startupSubmission: StartupSubmission | null
  onEdit: () => void
  isApproved: boolean
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-display font-bold text-enterprise-900">Profile Details</h2>
        {isApproved && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-enterprise-200 bg-white divide-y divide-enterprise-100">
        {/* Logo + name header */}
        <div className="p-5 flex items-center gap-4">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={profile.company_name}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-enterprise-900">{profile.company_name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-enterprise-500">
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {profile.category === 'tsp' ? 'Technology Service Provider' : 'Startup'}
              </span>
              <StatusBadge status={profile.status} />
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <Field icon={MapPin} label="Location" value={profile.location} />
          <Field icon={Users} label="Company Size" value={profile.company_size} />
          <Field icon={Globe} label="Website" value={profile.website} isLink />
          {submission && (
            <Field
              icon={Building2}
              label="Founded"
              value={submission.founding_year?.toString()}
            />
          )}
        </div>

        {/* About */}
        {isTsp && tspSubmission?.about_text && (
          <div className="p-5">
            <p className="text-xs font-semibold text-enterprise-500 uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-enterprise-700 whitespace-pre-line">{tspSubmission.about_text}</p>
          </div>
        )}

        {!isTsp && startupSubmission?.product_description && (
          <div className="p-5">
            <p className="text-xs font-semibold text-enterprise-500 uppercase tracking-wider mb-2">Product Description</p>
            <p className="text-sm text-enterprise-700 whitespace-pre-line">{startupSubmission.product_description}</p>
          </div>
        )}

        {/* Contact info */}
        {submission && (submission.contact_name || submission.contact_email) && (
          <div className="p-5">
            <p className="text-xs font-semibold text-enterprise-500 uppercase tracking-wider mb-2">Primary Contact</p>
            <div className="space-y-1 text-sm text-enterprise-700">
              {submission.contact_name && <p>{submission.contact_name}</p>}
              {submission.contact_email && <p>{submission.contact_email}</p>}
              {submission.contact_phone && <p>{submission.contact_phone}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edit mode
// ---------------------------------------------------------------------------

function EditMode({
  profile,
  submission,
  isTsp,
  onCancel,
  onSave,
  isSaving,
}: {
  profile: NonNullable<ReturnType<typeof useProviderProfile>['data']>
  submission: TspSubmission | StartupSubmission | null
  isTsp: boolean
  onCancel: () => void
  onSave: (diff: Record<string, unknown>) => void
  isSaving: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      company_name: profile.company_name,
      location: profile.location,
      company_size: profile.company_size,
      website: profile.website ?? '',
      about_text: isTsp
        ? (submission as TspSubmission | null)?.about_text ?? ''
        : (submission as StartupSubmission | null)?.product_description ?? '',
      contact_name: submission?.contact_name ?? '',
      contact_email: submission?.contact_email ?? '',
      contact_phone: submission?.contact_phone ?? '',
    },
  })

  const onSubmit = handleSubmit((data) => {
    // Compute diff: only include fields that changed
    const original: Record<string, unknown> = {
      company_name: profile.company_name,
      location: profile.location,
      company_size: profile.company_size,
      website: profile.website ?? '',
      about_text: isTsp
        ? (submission as TspSubmission | null)?.about_text ?? ''
        : (submission as StartupSubmission | null)?.product_description ?? '',
      contact_name: submission?.contact_name ?? '',
      contact_email: submission?.contact_email ?? '',
      contact_phone: submission?.contact_phone ?? '',
    }

    const diff: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== original[key]) {
        diff[key] = value || null
      }
    }

    if (Object.keys(diff).length === 0) {
      onCancel()
      return
    }

    onSave(diff)
  })

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-display font-bold text-enterprise-900">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-enterprise-500 hover:bg-enterprise-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>

      <div className="rounded-xl border border-enterprise-200 bg-white p-5">
        <p className="text-xs text-enterprise-500 mb-5">
          Changes are submitted for admin review. Your live profile stays unchanged until approved.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Company Name
              </label>
              <input id="company_name" type="text" {...register('company_name')} className={inputClass} />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Location
              </label>
              <input id="location" type="text" {...register('location')} className={inputClass} />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company_size" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Company Size
              </label>
              <input id="company_size" type="text" {...register('company_size')} className={inputClass} />
              {errors.company_size && (
                <p className="mt-1 text-sm text-red-600">{errors.company_size.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Website
              </label>
              <input id="website" type="text" placeholder="https://..." {...register('website')} className={inputClass} />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="about_text" className="block text-sm font-medium text-enterprise-700 mb-1.5">
              {isTsp ? 'About' : 'Product Description'}
            </label>
            <textarea
              id="about_text"
              rows={4}
              {...register('about_text')}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div className="border-t border-enterprise-100 pt-5">
            <h3 className="text-sm font-semibold text-enterprise-900 mb-4">Primary Contact</h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="contact_name" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                  Name
                </label>
                <input id="contact_name" type="text" {...register('contact_name')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                  Email
                </label>
                <input id="contact_email" type="email" {...register('contact_email')} className={inputClass} />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                  Phone
                </label>
                <input id="contact_phone" type="tel" {...register('contact_phone')} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-enterprise-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-enterprise-200 text-sm font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function Field({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null | undefined
  isLink?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-enterprise-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-enterprise-500">{label}</p>
        {value ? (
          isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm text-enterprise-900">{value}</p>
          )
        ) : (
          <p className="text-sm text-enterprise-400 italic">Not set</p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  }[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}
