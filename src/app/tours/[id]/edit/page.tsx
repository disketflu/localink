"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { use } from "react"
import { Input, Textarea } from "@/components/ui/Input"

interface Tour {
  id: string
  title: string
  description: string
  location: string
  price: number
  duration: number
  maxGroupSize: number
  included: string[]
  imageUrl: string
}

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [tour, setTour] = useState<Tour | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    duration: "",
    maxGroupSize: "",
    includedItems: "",
    imageUrl: "",
  })

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`/api/tours/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch tour")
        }
        const data = await response.json()
        setTour(data)
        setFormData({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price.toString(),
          duration: data.duration.toString(),
          maxGroupSize: data.maxGroupSize.toString(),
          includedItems: data.included.join(", "),
          imageUrl: data.imageUrl || "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tour")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchTour()
    }
  }, [resolvedParams.id, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const includedItems = formData.includedItems
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      const response = await fetch(`/api/tours/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          maxGroupSize: parseInt(formData.maxGroupSize),
          included: includedItems,
          imageUrl: formData.imageUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update tour")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tour")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (error && !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">
          {error || "Tour not found"}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-8">Edit Tour</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Input
                label="Tour Title"
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter a descriptive title for your tour"
                helperText="Make it catchy and descriptive"
              />

              <Textarea
                label="Description"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                placeholder="Describe your tour in detail..."
                helperText="Minimum 50 characters. Include key highlights and what makes your tour unique."
              />

              <Input
                label="Location"
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="Enter the tour location"
                helperText="Be specific about the city/region"
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="Price (USD)"
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  helperText="Set a competitive price"
                />

                <Input
                  label="Duration (hours)"
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  min="1"
                  required
                  placeholder="Enter duration"
                  helperText="Total tour duration"
                />
              </div>

              <Input
                label="Maximum Group Size"
                type="number"
                id="maxGroupSize"
                value={formData.maxGroupSize}
                onChange={(e) => setFormData({ ...formData, maxGroupSize: e.target.value })}
                min="1"
                required
                placeholder="Enter maximum group size"
                helperText="Consider the optimal group size for the best experience"
              />

              <Input
                label="What's Included"
                type="text"
                id="includedItems"
                value={formData.includedItems}
                onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                required
                placeholder="e.g., Guide, Transportation, Snacks"
                helperText="Separate items with commas"
              />

              <Input
                label="Image URL"
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/tour-image.jpg"
                helperText="Add a representative image of your tour (optional)"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 