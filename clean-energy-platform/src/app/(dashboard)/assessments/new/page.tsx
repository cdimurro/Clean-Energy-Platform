/**
 * New Assessment Page (Step 1)
 *
 * User enters title, description, and uploads supporting documents
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Card, Button, Input, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { useAssessmentStore, useHydration } from '@/lib/store'

// Supported file types
const SUPPORTED_FILE_TYPES = [
  { ext: 'pdf', mime: 'application/pdf', label: 'PDF' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel' },
  { ext: 'csv', mime: 'text/csv', label: 'CSV' },
  { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PowerPoint' },
  { ext: 'png', mime: 'image/png', label: 'PNG' },
  { ext: 'jpg', mime: 'image/jpeg', label: 'JPEG' },
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_FILES = 10

interface UploadedFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function NewAssessmentPage() {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Store actions
  const createAssessment = useAssessmentStore((state) => state.createAssessment)
  const setPlan = useAssessmentStore((state) => state.setPlan)
  const setEnhancedPlan = useAssessmentStore((state) => state.setEnhancedPlan)
  const isHydrated = useHydration()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<{ title?: string; description?: string }>({})

  console.log('[NewAssessment] Render - isHydrated:', isHydrated)

  // Wait for hydration before rendering
  if (!isHydrated) {
    console.log('[NewAssessment] Waiting for hydration...')
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-foreground-muted animate-spin" />
        <p className="mt-2 text-sm text-foreground-muted">Loading...</p>
      </div>
    )
  }

  // Handle file selection
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    const validFiles: UploadedFile[] = []

    Array.from(newFiles).forEach((file) => {
      // Check if we're at max files
      if (files.length + validFiles.length >= MAX_FILES) {
        return
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        validFiles.push({
          id: crypto.randomUUID(),
          file,
          status: 'error',
          error: 'File too large (max 50MB)',
        })
        return
      }

      // Check file type
      const isValidType = SUPPORTED_FILE_TYPES.some(
        (type) => file.type === type.mime || file.name.endsWith(`.${type.ext}`)
      )

      if (!isValidType) {
        validFiles.push({
          id: crypto.randomUUID(),
          file,
          status: 'error',
          error: 'Unsupported file type',
        })
        return
      }

      // Add valid file
      validFiles.push({
        id: crypto.randomUUID(),
        file,
        status: 'success',
      })
    })

    setFiles((prev) => [...prev, ...validFiles])
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  // Remove file
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return FileText
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Validate form
  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.trim().length < 50) {
      newErrors.description = 'Please provide a more detailed description (at least 50 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[NewAssessment] Form submitted')

    if (!validateForm()) {
      console.log('[NewAssessment] Validation failed')
      return
    }

    setIsSubmitting(true)
    console.log('[NewAssessment] Creating assessment...')

    try {
      // Create assessment in store
      const assessmentId = createAssessment(title.trim(), description.trim())
      console.log('[NewAssessment] Assessment created with ID:', assessmentId)

      // Detect technology type from title/description
      const titleLower = title.toLowerCase()
      const descLower = description.toLowerCase()
      let technologyType: string = 'generic'

      if (titleLower.includes('electrolyzer') || titleLower.includes('electrolysis') || descLower.includes('hydrogen')) {
        technologyType = 'hydrogen'
      } else if (titleLower.includes('solar') || titleLower.includes('pv') || titleLower.includes('photovoltaic')) {
        technologyType = 'solar'
      } else if (titleLower.includes('battery') || titleLower.includes('storage')) {
        technologyType = 'storage'
      } else if (titleLower.includes('wind') || titleLower.includes('turbine')) {
        technologyType = 'wind'
      } else if (titleLower.includes('fuel cell')) {
        technologyType = 'hydrogen'
      } else if (titleLower.includes('htl') || titleLower.includes('biocrude') || titleLower.includes('waste-to-fuel') || descLower.includes('waste')) {
        technologyType = 'waste-to-fuel'
      } else if (titleLower.includes('geothermal')) {
        technologyType = 'geothermal'
      } else if (titleLower.includes('nuclear')) {
        technologyType = 'nuclear'
      } else if (titleLower.includes('biomass')) {
        technologyType = 'biomass'
      }

      console.log('[NewAssessment] Detected technology type:', technologyType)

      // Prepare document data for API
      const documentData = files
        .filter((f) => f.status === 'success')
        .map((f) => ({
          id: f.id,
          name: f.file.name,
          type: f.file.type,
        }))

      // Call the generate-plan API to get enhanced plan with source attribution
      console.log('[NewAssessment] Calling generate-plan API...')
      const response = await fetch(`/api/assessments/${assessmentId}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          technologyType,
          documents: documentData,
        }),
      })

      if (response.ok) {
        const { plan } = await response.json()
        console.log('[NewAssessment] Enhanced plan generated successfully')

        // Set the enhanced plan with source attribution
        setEnhancedPlan(assessmentId, plan)
      } else {
        console.warn('[NewAssessment] Generate-plan API failed, falling back to legacy plan')

        // Fall back to legacy plan generation
        setPlan(assessmentId, {
          id: crypto.randomUUID(),
          version: 1,
          technologyType,
          identifiedClaims: [],
          extractedParameters: {},
          sections: [
            { id: '1', name: 'Technology Deep Dive', enabled: true, estimatedPages: '5-7' },
            { id: '2', name: 'Claims Validation', enabled: true, estimatedPages: '2-3' },
            { id: '3', name: 'Performance Simulation', enabled: true, estimatedPages: '10-15' },
            { id: '4', name: 'System Integration', enabled: true, estimatedPages: '5-7' },
            { id: '5', name: 'Techno-Economic Analysis', enabled: true, estimatedPages: '8-10' },
            { id: '6', name: 'Improvement Opportunities', enabled: true, estimatedPages: '5-10' },
            { id: '7', name: 'Final Assessment', enabled: true, estimatedPages: '3-5' },
          ],
          missingData: [],
          assumptions: [],
          createdAt: new Date(),
        })
      }

      console.log('[NewAssessment] Plan set, waiting for persist...')

      // Wait for store to persist before navigation
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log('[NewAssessment] Navigating to:', `/assessments/${assessmentId}`)
      // Use window.location for more reliable navigation with persisted state
      window.location.href = `/assessments/${assessmentId}`
    } catch (error) {
      console.error('[NewAssessment] Error:', error)
      setIsSubmitting(false)
    }
  }

  const validFiles = files.filter((f) => f.status === 'success')
  const canSubmit = title.trim() && description.trim().length >= 50

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={PlusCircle}
        title="New Assessment"
        description="Step 1: Describe your technology"
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          {/* Title */}
          <Card>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1.5 block">
                Technology / Project Title <span className="text-red-500">*</span>
              </span>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
                }}
                placeholder="e.g., Perovskite-Silicon Tandem Solar Cells"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </label>
          </Card>

          {/* Description */}
          <Card>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1.5 block">
                Technology Description <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-foreground-muted mb-2">
                Describe how the technology works, what problem it solves, and any key claims or metrics.
                The more detail you provide, the better the assessment will be.
              </p>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
                }}
                placeholder="Describe the technology, its core innovation, key performance claims, target market, and any other relevant information..."
                rows={8}
                className={`w-full px-3 py-2 rounded-lg bg-background-surface border ${
                  errors.description ? 'border-red-500' : 'border-border'
                } text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-xs text-foreground-muted">
                    {description.length < 50
                      ? `${50 - description.length} more characters needed`
                      : '✓ Minimum length met'}
                  </p>
                )}
                <p className="text-xs text-foreground-subtle">{description.length} characters</p>
              </div>
            </label>
          </Card>

          {/* File Upload */}
          <Card>
            <div className="mb-4">
              <span className="text-sm font-medium text-foreground block mb-1">
                Supporting Documents
              </span>
              <p className="text-xs text-foreground-muted">
                Upload pitch decks, white papers, patents, financial models, or any other supporting materials.
                AI will extract relevant information to inform the assessment.
              </p>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-background-hover'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                accept={SUPPORTED_FILE_TYPES.map((t) => `.${t.ext}`).join(',')}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
              <p className="text-foreground mb-1">
                Drop files here or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-foreground-muted">
                PDF, Word, Excel, PowerPoint, CSV, PNG, JPEG (max 50MB each)
              </p>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((uploadedFile) => {
                  const FileIcon = getFileIcon(uploadedFile.file.name)
                  return (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background-surface border border-border"
                    >
                      <FileIcon className="w-5 h-5 text-foreground-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{uploadedFile.file.name}</p>
                        <p className="text-xs text-foreground-muted">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                      </div>
                      {uploadedFile.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500">{uploadedFile.error}</span>
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        </div>
                      )}
                      {uploadedFile.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-primary shrink-0 animate-spin" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="p-1 rounded hover:bg-background-hover text-foreground-muted hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {validFiles.length > 0 && (
              <p className="text-xs text-foreground-muted mt-2">
                {validFiles.length} file{validFiles.length !== 1 ? 's' : ''} ready for upload
              </p>
            )}
          </Card>

          {/* What Happens Next */}
          <Card className="bg-background-elevated/50">
            <h3 className="font-medium text-foreground mb-2">What happens next?</h3>
            <ol className="space-y-2 text-sm text-foreground-muted">
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5">1</Badge>
                <span>AI analyzes your description and documents to understand the technology</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5">2</Badge>
                <span>An assessment plan is generated with key claims to validate</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5">3</Badge>
                <span>You review and approve the plan before execution begins</span>
              </li>
            </ol>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Generate Assessment Plan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
