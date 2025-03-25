"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ReviewForm from "@/components/ReviewForm"

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
  guide: {
    name: string
  }
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tour, setTour] = useState<Tour | null>(null)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`/api/tours/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch tour")
        }
        const data = await response.json()
        setTour(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tour")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchTour()
    }
  }, [status, params.id])

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">Tour not found</div>
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

              <ReviewForm
                tourId={tour.id}
                onSubmit={() => {
                  router.push(`/tours/${tour.id}`)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 