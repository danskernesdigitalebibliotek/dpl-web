import { NextResponse, connection } from "next/server"

import { withAuth } from "@/app/(routes)/pubhub/(lib)/helper"

import { getLibraryProfileRequest } from "./(lib)/requests"
import { getLibraryProfileSchema } from "./(lib)/schemas"

async function getLibraryProfile() {
  await connection() // Opt into dynamic rendering
  const libraryProfile = getLibraryProfileSchema.transform(libraryProfileData => {
    const libraryProfileResponse = libraryProfileData.response.data
    return {
      id: libraryProfileResponse.Id,
      name: libraryProfileResponse.Name,
      ebookLoanDurationInDays: libraryProfileResponse.LoanDurationInDays,
      maxEbookAmountPerMonth: libraryProfileResponse.MaxAmountPerMonth,
      maxEbookAmountPerMonthNotificationThreshold:
        libraryProfileResponse.MaxAmountPerMonthNotificationThreshold,
      maxConcurrentEbookLoansPerBorrower: libraryProfileResponse.MaxConcurrentLoansPerBorrower,
      maxConcurrentEbookReservationsPerBorrower:
        libraryProfileResponse.MaxConcurrentReservationsPerBorrower,
      maxEbookCancellationsPerMonth: libraryProfileResponse.MaxCancellationsPerMonth,
      audioLoanDurationInDays: libraryProfileResponse.AudioLoanDurationInDays,
      maxAudioAmountPerMonth: libraryProfileResponse.MaxAudioAmountPerMonth,
      maxAudioAmountPerMonthNotificationThreshold:
        libraryProfileResponse.MaxAudioAmountPerMonthNotificationThreshold,
      maxConcurrentAudioLoansPerBorrower: libraryProfileResponse.MaxConcurrentAudioLoansPerBorrower,
      maxConcurrentAudioReservationsPerBorrower:
        libraryProfileResponse.MaxConcurrentAudioReservationsPerBorrower,
      maxAudioCancellationsPerMonth: libraryProfileResponse.MaxAudioCancellationsPerMonth,
    }
  })

  try {
    const responseData = await getLibraryProfileRequest()
    return NextResponse.json(libraryProfile.parse(responseData))
  } catch (error) {
    console.error("getLibraryProfile error", error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

export const GET = withAuth(getLibraryProfile)
