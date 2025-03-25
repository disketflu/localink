"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Input, Textarea } from "@/components/ui/Input"

export default function CreateTourPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
      throw new Error("Title must be at least 3 characters long")
    }

    if (!description || description.length < 50) {
      throw new Error("Description must be at least 50 characters long")
    }

    if (!location) {
      throw new Error("Location is required")
    }

    if (isNaN(price) || price <= 0) {
      throw new Error("Price must be greater than 0")
    }

    if (isNaN(duration) || duration <= 0) {
      throw new Error("Duration must be greater than 0")
    }

    if (isNaN(maxGroupSize) || maxGroupSize <= 0) {
      throw new Error("Maximum group size must be greater than 0")
    }

    if (included.length === 0) {
      throw new Error("Please specify what's included in the tour")
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
        throw new Error(data.error || "Failed to create tour")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred while creating the tour")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-8">Create New Tour</h1>
          
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
                name="title"
                id="title"
                required
                placeholder="Enter a descriptive title for your tour"
                helperText="Make it catchy and descriptive"
              />

              <Textarea
                label="Description"
                name="description"
                id="description"
                rows={4}
                required
                placeholder="Describe your tour in detail..."
                helperText="Minimum 50 characters. Include key highlights and what makes your tour unique."
              />

              <Input
                label="Location"
                type="text"
                name="location"
                id="location"
                required
                placeholder="Enter the tour location"
                helperText="Be specific about the city/region"
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="Price (USD)"
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  helperText="Set a competitive price"
                />

                <Input
                  label="Duration (hours)"
                  type="number"
                  name="duration"
                  id="duration"
                  min="1"
                  required
                  placeholder="Enter duration"
                  helperText="Total tour duration"
                />
              </div>

              <Input
                label="Maximum Group Size"
                type="number"
                name="maxGroupSize"
                id="maxGroupSize"
                min="1"
                required
                placeholder="Enter maximum group size"
                helperText="Consider the optimal group size for the best experience"
              />

              <Input
                label="What's Included"
                type="text"
                name="included"
                id="included"
                required
                placeholder="e.g., Guide, Transportation, Snacks"
                helperText="Separate items with commas"
              />

              <Input
                label="Image URL"
                type="url"
                name="imageUrl"
                id="imageUrl"
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
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Tour"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 