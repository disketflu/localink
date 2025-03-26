"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input, Textarea } from "@/components/ui/Input"
import { useTranslations } from 'next-intl'

interface Profile {
  bio: string | null
  location: string | null
  languages: string[]
  expertise: string[]
}

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    languages: "",
    expertise: "",
    image: "",
  })
  const t = useTranslations()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setFormData({
          name: data.name || "",
          email: data.email || "",
          bio: data.profile?.bio || "",
          location: data.profile?.location || "",
          languages: data.profile?.languages?.join(", ") || "",
          expertise: data.profile?.expertise?.join(", ") || "",
          image: data.image || "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profileEdit.error.load'))
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
          profile: {
            bio: formData.bio,
            location: formData.location,
            languages: formData.languages.split(",").map((lang) => lang.trim()).filter(Boolean),
            expertise: formData.expertise.split(",").map((exp) => exp.trim()).filter(Boolean),
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('profileEdit.error.update'))
      }

      router.push(session?.user?.role === "GUIDE" ? "/dashboard/guide" : "/dashboard/tourist")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profileEdit.error.update'))
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('profileEdit.loading')}</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-8">
            {t('profileEdit.title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Input
                label={t('profileEdit.form.name.label')}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder={t('profileEdit.form.name.placeholder')}
                helperText={t('profileEdit.form.name.required')}
              />

              <Input
                label={t('profileEdit.form.email.label')}
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
                helperText={t('profileEdit.form.email.disabled')}
              />

              <Input
                label={t('profileEdit.form.image.label')}
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder={t('profileEdit.form.image.placeholder')}
                helperText={t('profileEdit.form.image.helper')}
              />

              <Textarea
                label={t('profileEdit.form.bio.label')}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t('profileEdit.form.bio.placeholder')}
                rows={4}
                helperText={t('profileEdit.form.bio.helper')}
              />

              <Input
                label={t('profileEdit.form.location.label')}
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('profileEdit.form.location.placeholder')}
                helperText={t('profileEdit.form.location.helper')}
              />

              <Input
                label={t('profileEdit.form.languages.label')}
                type="text"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder={t('profileEdit.form.languages.placeholder')}
                helperText={t('profileEdit.form.languages.helper')}
              />

              {session?.user?.role === "GUIDE" && (
                <Input
                  label={t('profileEdit.form.expertise.label')}
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder={t('profileEdit.form.expertise.placeholder')}
                  helperText={t('profileEdit.form.expertise.helper')}
                />
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                {t('profileEdit.buttons.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? t('profileEdit.buttons.saving') : t('profileEdit.buttons.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 