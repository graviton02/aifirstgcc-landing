import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import type { StartupSubmission } from '@/types/provider'

const schema = z.object({
  website: z.string().url('Must be a valid URL').nullable().or(z.literal('')),
  founding_year: z.coerce.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').nullable().optional(),
  funding_stage: z.string().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface StartupPage1Props {
  submission: StartupSubmission | null
  onSave: (data: Partial<StartupSubmission>, logoFile?: File | null) => void
  onSaveAndExit: (data: Partial<StartupSubmission>, logoFile?: File | null) => void
  isSaving: boolean
}

export function StartupPage1({ submission, onSave, onSaveAndExit, isSaving }: StartupPage1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      website: '',
      founding_year: undefined,
      funding_stage: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        website: submission.website ?? '',
        founding_year: submission.founding_year ?? undefined,
        funding_stage: submission.funding_stage ?? '',
      })
      // Show existing logo as preview
      if (submission.logo_url && !logoFile) {
        setPreview(submission.logo_url)
      }
    }
  }, [submission, reset, logoFile])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) return // 2MB limit
    setLogoFile(file)
    setPreview(URL.createObjectURL(file))
    setLogoError(false)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  function clearFile() {
    setLogoFile(null)
    setPreview(null)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleSaveAndNext = handleSubmit((data) => {
    if (!preview) {
      setLogoError(true)
      return
    }
    onSave(cleanData(data), logoFile)
  })

  const handleSaveAndExitClick = () => {
    const data = getValues()
    onSaveAndExit(cleanData(data), logoFile)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">Company Profile</h2>
        <p className="text-sm text-enterprise-500 mt-1">Basic details about your startup.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Company Logo <span className="text-red-500">*</span>
          </label>
          {preview ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="w-20 h-20 rounded-xl object-cover border border-enterprise-200"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-sm text-enterprise-700 font-medium">
                  {logoFile ? logoFile.name : 'Current logo'}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-1"
                >
                  Replace image
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : logoError
                    ? 'border-red-400 bg-red-50'
                    : 'border-enterprise-300 hover:border-purple-400 hover:bg-enterprise-50'
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 ${isDragging ? 'bg-purple-100' : 'bg-enterprise-100'}`}>
                {isDragging ? (
                  <Upload className="w-5 h-5 text-purple-500" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-enterprise-400" />
                )}
              </div>
              <p className="text-sm text-enterprise-600 font-medium">
                {isDragging ? 'Drop image here' : 'Click or drag to upload logo'}
              </p>
              <p className="text-xs text-enterprise-400 mt-1">PNG, JPG, or SVG. Max 2MB.</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {logoError && (
            <p className="mt-1 text-sm text-red-600">Company logo is required</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Website
          </label>
          <input
            id="website"
            type="text"
            placeholder="https://yourstartup.com"
            {...register('website')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="founding_year" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Founding Year
          </label>
          <input
            id="founding_year"
            type="number"
            placeholder="2023"
            {...register('founding_year')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          {errors.founding_year && (
            <p className="mt-1 text-sm text-red-600">{errors.founding_year.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="funding_stage" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Funding Stage
          </label>
          <select
            id="funding_stage"
            {...register('funding_stage')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="">Select funding stage</option>
            <option value="pre-seed">Pre-Seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
            <option value="series-b">Series B</option>
            <option value="series-c+">Series C+</option>
            <option value="bootstrapped">Bootstrapped</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-enterprise-100">
          <button
            type="button"
            onClick={handleSaveAndExitClick}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-enterprise-200 text-sm font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors disabled:opacity-60"
          >
            Save & Exit
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Next
          </button>
        </div>
      </form>
    </div>
  )
}

function cleanData(data: FormData): Partial<StartupSubmission> {
  return {
    website: data.website || null,
    founding_year: data.founding_year || null,
    funding_stage: data.funding_stage || null,
  }
}
