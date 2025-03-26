"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Input, Textarea } from "@/components/ui/Input"
import { useTranslations } from 'next-intl'

export default function CreateTourPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('tours.create')

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "GUIDE") {
    router.push("/")
    return null
  }

  const validateForm = (formData: FormData) => {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const price = parseFloat(formData.get("price") as string)
    const duration = parseInt(formData.get("duration") as string)
    const maxGroupSize = parseInt(formData.get("maxGroupSize") as string)
    const included = formData.get("included")?.toString().split(",").map(item => item.trim()) || []

    if (!title || title.length < 3) {
      throw new Error(t('form.title.error'))
    }

    if (!description || description.length < 50) {
      throw new Error(t('form.description.error'))
    }

    if (!location) {
      throw new Error(t('form.location.error'))
    }

    if (isNaN(price) || price <= 0) {
      throw new Error(t('form.price.error'))
    }

    if (isNaN(duration) || duration <= 0) {
      throw new Error(t('form.duration.error'))
    }

    if (isNaN(maxGroupSize) || maxGroupSize <= 0) {
      throw new Error(t('form.maxGroupSize.error'))
    }

    if (included.length === 0) {
      throw new Error(t('form.included.error'))
    }

    return {
      title,
      description,
      location,
      price,
      duration,
      maxGroupSize,
      included,
      imageUrl: formData.get("imageUrl") as string,
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const validatedData = validateForm(formData)

      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('error'))
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(t('error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-8">{t('title')}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Input
                label={t('form.title.label')}
                type="text"
                name="title"
                id="title"
                required
                placeholder={t('form.title.placeholder')}
                helperText={t('form.title.helper')}
              />

              <Textarea
                label={t('form.description.label')}
                name="description"
                id="description"
                rows={4}
                required
                placeholder={t('form.description.placeholder')}
                helperText={t('form.description.helper')}
              />

              <Input
                label={t('form.location.label')}
                type="text"
                name="location"
                id="location"
                required
                placeholder={t('form.location.placeholder')}
                helperText={t('form.location.helper')}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label={t('form.price.label')}
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  step="0.01"
                  required
                  placeholder={t('form.price.placeholder')}
                  helperText={t('form.price.helper')}
                />

                <Input
                  label={t('form.duration.label')}
                  type="number"
                  name="duration"
                  id="duration"
                  min="1"
                  required
                  placeholder={t('form.duration.placeholder')}
                  helperText={t('form.duration.helper')}
                />
              </div>

              <Input
                label={t('form.maxGroupSize.label')}
                type="number"
                name="maxGroupSize"
                id="maxGroupSize"
                min="1"
                required
                placeholder={t('form.maxGroupSize.placeholder')}
                helperText={t('form.maxGroupSize.helper')}
              />

              <Input
                label={t('form.included.label')}
                type="text"
                name="included"
                id="included"
                required
                placeholder={t('form.included.placeholder')}
                helperText={t('form.included.helper')}
              />

              <Input
                label={t('form.imageUrl.label')}
                type="url"
                name="imageUrl"
                id="imageUrl"
                placeholder={t('form.imageUrl.placeholder')}
                helperText={t('form.imageUrl.helper')}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                {t('buttons.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('buttons.submitting') : t('buttons.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 