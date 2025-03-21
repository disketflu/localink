"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { use } from "react"
import { format } from "date-fns"
import Image from "next/image"
import { StarIcon } from "@heroicons/react/20/solid"
import ReviewForm from "@/components/ReviewForm"
import ReviewList from "@/components/ReviewList"

interface Tour {
  id: string
  title: string
  description: string
  location: string
  price: number
  duration: number
  maxGroupSize: number
  imageUrl: string
  included: string[]
  guide: {
    id: string
    name: string
    image: string
  }
  reviews: {
    id: string
    rating: number
    comment: string
    createdAt: string
    author: {
      name: string
      image: string
    }
  }[]
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  author: {
    name: string
    image: string | null
  }
}

export default function TourDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)

  const resolvedParams = use(params)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchTourAndReviews = async () => {
      try {
        const [tourResponse, reviewsResponse] = await Promise.all([
          fetch(`/api/tours/${resolvedParams.id}`),
          fetch(`/api/reviews?tourId=${resolvedParams.id}`),
        ])

        if (!tourResponse.ok || !reviewsResponse.ok) {
          throw new Error("Failed to fetch tour or reviews")
        }

        const [tourData, reviewsData] = await Promise.all([
          tourResponse.json(),
          reviewsResponse.json(),
        ])

        setTour(tourData)
        setReviews(reviewsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tour details")
      } finally {
        setLoading(false)
      }
    }

    fetchTourAndReviews()
  }, [resolvedParams.id])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !tour) return

    setBookingLoading(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tourId: tour.id,
          date: bookingDate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create booking")
      }

      router.push("/dashboard/bookings")
    } catch (error) {
      console.error("Error creating booking:", error)
      setError("Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || "Tour not found"}</p>
        </div>
      </div>
    )
  }

  const averageRating = tour.reviews.length > 0
    ? tour.reviews.reduce((acc, review) => acc + review.rating, 0) / tour.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative h-96">
            {tour.imageUrl ? (
              <img
                src={tour.imageUrl}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tour.title}</h1>
                <p className="mt-2 text-gray-600">{tour.location}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">${tour.price}</p>
                <p className="text-sm text-gray-500">per person</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold text-gray-900">About this tour</h2>
                  <p className="mt-4 text-gray-600">{tour.description}</p>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">What's included</h2>
                  <ul className="mt-4 space-y-2">
                    {tour.included.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                  <div className="mt-4 space-y-6">
                    {tour.reviews.length === 0 ? (
                      <p className="text-gray-500">No reviews yet</p>
                    ) : (
                      tour.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center">
                            <img
                              src={review.author.image}
                              alt={review.author.name}
                              className="h-10 w-10 rounded-full"
                            />
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{review.author.name}</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {format(new Date(review.createdAt), "MMMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900">Book this tour</h2>
                  <form onSubmit={handleBooking} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Select Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duration:</span> {tour.duration} hours
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Max group size:</span> {tour.maxGroupSize} people
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bookingLoading ? "Booking..." : "Book Now"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        <div className="mt-8">
          <ReviewList reviews={reviews} />
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Write a Review</h3>
          <div className="mt-4">
            <ReviewForm
              tourId={resolvedParams.id}
              onSubmit={() => {
                // Refresh reviews after submission
                fetch(`/api/reviews?tourId=${resolvedParams.id}`)
                  .then((res) => res.json())
                  .then(setReviews)
                  .catch(console.error)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 