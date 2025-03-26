"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { use } from "react"
import Image from "next/image"
import { StarIcon } from "@heroicons/react/20/solid"
import ReviewForm from "@/components/ReviewForm"
import { Input } from "@/components/ui/Input"

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

interface Booking {
  id: string
  tourId: string
  touristId: string
  status: string
  date: string
}

export default function TourDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tour, setTour] = useState<Tour | null>(null)
  const [userBooking, setUserBooking] = useState<Booking | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingError, setBookingError] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tourResponse = await fetch(`/api/tours/${resolvedParams.id}`)
        if (!tourResponse.ok) {
          throw new Error("Failed to fetch tour data")
        }
        const tourData = await tourResponse.json()
        setTour(tourData)

        // Only fetch bookings if user is authenticated
        if (session?.user) {
          const bookingsResponse = await fetch("/api/bookings")
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json()
            // Find user's completed booking for this tour
            const userBooking = bookingsData.find(
              (booking: Booking) =>
                booking.tourId === resolvedParams.id &&
                booking.touristId === session.user.id &&
                booking.status === "COMPLETED"
            )
            setUserBooking(userBooking)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tour details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, session?.user])

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
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      router.push("/dashboard/tourist")
    } catch (error) {
      console.error("Error creating booking:", error)
      setBookingError(error instanceof Error ? error.message : "Failed to create booking")
    } finally {
      setBookingLoading(false)
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
        <div className="text-center">
          <p className="text-red-600">{error || "Tour not found"}</p>
        </div>
      </div>
    )
  }

  const reviews = tour.reviews || []
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
                  <h2 className="text-xl font-semibold text-gray-900">What&apos;s included</h2>
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
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900">Book this tour</h2>
                  <form onSubmit={handleBooking} className="mt-5">
                    {bookingError && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {bookingError}
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <Input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? "Booking..." : "Book Now"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        {session?.user?.role === "TOURIST" && !userBooking && (
          <div className="mt-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Book this tour
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Select a date to book this tour.</p>
                </div>

                <form onSubmit={handleBooking} className="mt-5">
                  {bookingError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {bookingError}
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <Input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? "Booking..." : "Book Now"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {session?.user?.role === "TOURIST" && userBooking && (
          <div className="mt-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Leave a Review
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Share your experience with this tour.</p>
                </div>

                <div className="mt-5">
                  <ReviewForm
                    tourId={resolvedParams.id}
                    onSubmit={async () => {
                      // Refresh tour data after submission
                      const response = await fetch(`/api/tours/${resolvedParams.id}`)
                      if (response.ok) {
                        const tourData = await response.json()
                        setTour(tourData)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Reviews
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>What others are saying about this tour.</p>
              </div>

              <div className="mt-5 space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-t border-gray-200 pt-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {review.author.image ? (
                            <Image
                              src={review.author.image}
                              alt={review.author.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">
                                {review.author.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.author.name}
                          </h4>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <StarIcon
                                key={value}
                                className={`h-4 w-4 ${
                                  value <= review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                className={`h-5 w-5 ${
                  rating < averageRating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="ml-2 text-sm text-gray-600">
            {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
          </p>
        </div>
      </div>
    </div>
  )
} 