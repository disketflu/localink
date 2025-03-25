"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { StarIcon } from "@heroicons/react/20/solid"

interface Tour {
  id: string
  title: string
  location: string
  guide: {
    name: string
  }
}

export default function ReviewPage({ params }: { params: { tourId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>("")
  const [tour, setTour] = useState<Tour | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (!params.tourId) {
          throw new Error("Tour ID is required")
        }
        const response = await fetch(`/api/tours/${params.tourId}`)
        if (!response.ok) {
          const error = await response.text()
          throw new Error(error || "Failed to fetch tour")
        }
        const data = await response.json()
        if (!data) {
          throw new Error("Tour not found")
        }
        setTour(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tour")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated" && params.tourId) {
      fetchTour()
    }
  }, [params.tourId, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !tour) return

    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tourId: params.tourId,
          rating,
          comment,
          type: "TOUR_REVIEW"
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to submit review")
      }

      router.push(`/tours/${params.tourId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">{error || "Tour not found"}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Review Your Experience
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Share your thoughts about your tour of {tour.title}
            </p>
          </div>

          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">{tour.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{tour.location}</p>
                <p className="mt-1 text-sm text-gray-500">Guide: {tour.guide.name}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-6 w-6 ${
                            value <= rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Share your experience..."
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 