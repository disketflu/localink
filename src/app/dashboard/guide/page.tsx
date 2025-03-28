"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { StarIcon } from "@heroicons/react/20/solid"
import Messages from "@/components/Messages"
import { useTranslations } from 'next-intl'

interface Profile {
  bio: string | null
  location: string | null
  languages: string[]
  expertise: string[]
}

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: "TOURIST" | "GUIDE"
  profile: Profile
}

declare module "next-auth" {
  interface Session {
    user: User
  }
}

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
  bookings: Booking[]
  reviews: Review[]
}

interface Booking {
  id: string
  date: string
  status: string
  tourist: {
    id: string
    name: string
    email: string
  }
  tour: {
    title: string
    imageUrl: string
    price: number
  }
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
  tour: {
    id: string
    title: string
  }
}

interface Earnings {
  total: number
  completed: number
  pending: number
  cancelled: number
}

export default function GuideDashboard() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tours, setTours] = useState<Tour[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [earnings, setEarnings] = useState<Earnings>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  })
  const [activeTab, setActiveTab] = useState("tours")
  const t = useTranslations('guideDashboard')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursResponse, bookingsResponse, reviewsResponse, profileResponse] = await Promise.all([
          fetch("/api/tours?guideId=" + session?.user?.id),
          fetch("/api/bookings?guideId=" + session?.user?.id),
          fetch("/api/reviews?guideId=" + session?.user?.id),
          fetch("/api/profile"),
        ])

        if (!toursResponse.ok || !bookingsResponse.ok || !reviewsResponse.ok || !profileResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [toursData, bookingsData, reviewsData, profileData] = await Promise.all([
          toursResponse.json(),
          bookingsResponse.json(),
          reviewsResponse.json(),
          profileResponse.json(),
        ])

        setTours(toursData)
        setBookings(bookingsData)
        setReviews(reviewsData)

        // Update session with profile data
        if (session) {
          session.user = {
            ...session.user,
            ...profileData,
          }
        }

        // Calculate earnings
        const earningsData = bookingsData.reduce(
          (acc: Earnings, booking: Booking) => {
            if (booking.status === "COMPLETED") {
              acc.completed += booking.tour.price
            } else if (booking.status === "PENDING") {
              acc.pending += booking.tour.price
            } else if (booking.status === "CANCELLED") {
              acc.cancelled += booking.tour.price
            }
            acc.total += booking.tour.price
            return acc
          },
          { total: 0, completed: 0, pending: 0, cancelled: 0 }
        )

        setEarnings(earningsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, session?.user?.id])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">{t('error')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
            <p className="mt-2 text-sm text-gray-700">
              {t('welcome', { name: session?.user?.name })}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/tours/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              {t('createTour')}
            </Link>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{t('earnings.total')}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              ${earnings.total.toFixed(2)}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{t('earnings.completed')}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              ${earnings.completed.toFixed(2)}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{t('earnings.pending')}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              ${earnings.pending.toFixed(2)}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{t('earnings.cancelled')}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              ${earnings.cancelled.toFixed(2)}
            </dd>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("tours")}
              className={`${
                activeTab === "tours"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              {t('tabs.tours')}
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`${
                activeTab === "bookings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              {t('tabs.bookings')}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`${
                activeTab === "messages"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              {t('tabs.messages')}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`${
                activeTab === "reviews"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              {t('tabs.reviews')}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`${
                activeTab === "profile"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              {t('tabs.profile')}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "tours" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    {tour.imageUrl ? (
                      <Image
                        src={tour.imageUrl}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">{t('tours.noImage')}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Link
                        href={`/tours/${tour.id}/edit`}
                        className="rounded-md bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        title={t('tours.edit')}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm(t('tours.deleteConfirm'))) {
                            try {
                              const response = await fetch(`/api/tours/${tour.id}`, {
                                method: "DELETE",
                              })
                              if (!response.ok) {
                                throw new Error("Failed to delete tour")
                              }
                              setTours(tours.filter((t) => t.id !== tour.id))
                            } catch (err) {
                              console.error("Error deleting tour:", err)
                            }
                          }
                        }}
                        className="rounded-md bg-white p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        title={t('tours.delete')}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{tour.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{tour.location}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {t('tours.bookings', { count: tour.bookings.length })}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${tour.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "messages" && (
            <Messages bookings={bookings} />
          )}

          {activeTab === "bookings" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {booking.tour.imageUrl ? (
                              <Image
                                src={booking.tour.imageUrl}
                                alt={booking.tour.title}
                                width={48}
                                height={48}
                                className="rounded-lg"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">{t('tours.noImage')}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {booking.tour.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('bookings.tourist', { name: booking.tourist.name })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t('bookings.date', { date: new Date(booking.date).toLocaleDateString() })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : booking.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {t(`bookings.status.${booking.status}`)}
                          </span>
                          {booking.status === "PENDING" && (
                            <button
                              onClick={async () => {
                                if (confirm(t('bookings.confirmConfirm'))) {
                                  try {
                                    const response = await fetch(
                                      `/api/bookings/${booking.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          status: "CONFIRMED"
                                        })
                                      }
                                    )
                                    if (!response.ok) {
                                      throw new Error("Failed to confirm booking")
                                    }
                                    // Update local state
                                    setBookings(bookings.map(b => 
                                      b.id === booking.id 
                                        ? { ...b, status: "CONFIRMED" }
                                        : b
                                    ))
                                  } catch (err) {
                                    console.error("Error confirming booking:", err)
                                  }
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {t('bookings.confirm')}
                            </button>
                          )}
                          {booking.status === "CONFIRMED" && (
                            <button
                              onClick={async () => {
                                if (confirm(t('bookings.markAsCompletedConfirm'))) {
                                  try {
                                    const response = await fetch(
                                      `/api/bookings/${booking.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          status: "COMPLETED"
                                        })
                                      }
                                    )
                                    if (!response.ok) {
                                      throw new Error("Failed to mark booking as completed")
                                    }
                                    // Update local state
                                    setBookings(bookings.map(b => 
                                      b.id === booking.id 
                                        ? { ...b, status: "COMPLETED" }
                                        : b
                                    ))
                                  } catch (err) {
                                    console.error("Error marking booking as completed:", err)
                                  }
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              {t('bookings.markAsCompleted')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {reviews.length === 0 ? (
                  <li>
                    <div className="px-4 py-5 sm:px-6">
                      <div className="text-center text-gray-500">
                        {t('reviews.noReviews')}
                      </div>
                    </div>
                  </li>
                ) : (
                  reviews.map((review) => (
                    <li key={review.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {review.tour.title}
                            </h4>
                            <div className="mt-1 flex items-center">
                              <div className="flex items-center">
                                {review.author.image ? (
                                  <Image
                                    src={review.author.image}
                                    alt={review.author.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full mr-2"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                    <span className="text-xs text-gray-500">
                                      {review.author.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <span className="text-sm text-gray-600 mr-2">
                                  {t('reviews.by', { name: review.author.name })}
                                </span>
                              </div>
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
                            <p className="mt-1 text-sm text-gray-500">
                              {review.comment}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('reviews.on', { date: new Date(review.createdAt).toLocaleDateString() })}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {t('profile.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('profile.subtitle')}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.profilePicture')}</dt>
                    <dd className="mt-2 flex items-center">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Profile"}
                          width={96}
                          height={96}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">{t('tours.noImage')}</span>
                        </div>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.name')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.name || t('profile.notProvided')}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.email')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.bio')}</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {session?.user?.profile?.bio || t('profile.notProvided')}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.location')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.profile?.location || t('profile.notSpecified')}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.languages')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.profile?.languages?.length > 0
                        ? session.user.profile.languages.join(", ")
                        : t('profile.noneSpecified')}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.expertise')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.profile?.expertise?.length > 0
                        ? session.user.profile.expertise.join(", ")
                        : t('profile.noneSpecified')}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.totalTours')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tours.length}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.totalBookings')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {tours.reduce((acc, tour) => acc + tour.bookings.length, 0)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">{t('profile.averageRating')}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {tours.reduce((acc, tour) => {
                        const ratings = tour.reviews?.map((r) => r.rating) || []
                        return acc + (ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0)
                      }, 0) / (tours.length || 1)}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-end">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                  >
                    {t('profile.editProfile')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 