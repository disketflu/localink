"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  author: {
    name: string | null
    image: string | null
  }
  tour: {
    title: string
  }
}

export default function ReviewsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchReviews = async () => {
      try {
        if (!session?.user?.id) {
          throw new Error("User session not found")
        }

        const queryParam = session.user.role === "GUIDE" 
          ? `guideId=${session.user.id}`
          : `authorId=${session.user.id}`
        
        const response = await fetch(`/api/reviews?${queryParam}`)
        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }
        const data = await response.json()
        setReviews(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchReviews()
    }
  }, [status, router, session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
          {session?.user.role === "GUIDE" ? "Reviews from Tourists" : "My Reviews"}
        </h1>

        <div className="mt-8">
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {review.author.image ? (
                      <Image
                        src={review.author.image}
                        alt={review.author.name || ""}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300" />
                    )}
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">{review.author.name}</p>
                      <p className="text-sm text-gray-500">{format(new Date(review.createdAt), "MMMM d, yyyy")}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    Tour: <span className="font-medium">{review.tour.title}</span>
                  </p>

                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {session?.user.role === "GUIDE"
                  ? "No reviews received yet."
                  : "You haven't written any reviews yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 