import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createBiblioClient } from "./client"

const baseUrl = "https://biblio.example"
const metadataUrl = (isbn: string) => `${baseUrl}/v1/metadata/${isbn}`

const mockJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  }) as Response

// Complete, as the contract requires: the mapper rejects a partial record.
const ebookBody = {
  materials: [
    {
      isbn: "9788711234567",
      material_type: "ebook",
      title: "Din for en sommer",
      description: "En intens romance",
      publish_date: "2026-06-18T00:00:00.000Z",
      languages: ["dan"],
    },
  ],
}

const buildClient = (getAuthHeader: () => Promise<string> | string = () => "Bearer abc") =>
  createBiblioClient({ baseUrl, getAuthHeader })

describe("createBiblioClient.getMetadata", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches the metadata endpoint with the auth header and returns the mapped DTO", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(ebookBody))

    const result = await buildClient().getMetadata("9788711234567")

    expect(fetch).toHaveBeenCalledWith(metadataUrl("9788711234567"), {
      method: "GET",
      headers: { authorization: "Bearer abc" },
    })
    expect(result).toEqual({
      isbn: "9788711234567",
      materialType: "ebook",
      title: "Din for en sommer",
      description: "En intens romance",
      publishDate: "2026-06-18T00:00:00.000Z",
      languages: ["dan"],
      authors: [],
    })
  })

  it("awaits an async auth header callback", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(ebookBody))

    await buildClient(async () => "Bearer async-token").getMetadata("9788711234567")

    expect(fetch).toHaveBeenCalledWith(
      metadataUrl("9788711234567"),
      expect.objectContaining({
        headers: { authorization: "Bearer async-token" },
      })
    )
  })

  it("url-encodes the isbn", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(ebookBody))

    await buildClient().getMetadata("978 8711234567")

    expect(fetch).toHaveBeenCalledWith(metadataUrl("978%208711234567"), expect.anything())
  })

  it("returns undefined on a 404 (unknown material)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 404))

    await expect(buildClient().getMetadata("0000000000000")).resolves.toBeUndefined()
  })

  it("throws on a non-2xx response other than 404", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 401))

    await expect(buildClient().getMetadata("9788711234567")).rejects.toThrow(/401/)
  })

  it("throws on a 5xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({}, 503))

    await expect(buildClient().getMetadata("9788711234567")).rejects.toThrow(/503/)
  })

  it("throws when the response shape fails validation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ materials: [{ isbn: "9788711234567", material_type: "paper_book" }] })
    )

    await expect(buildClient().getMetadata("9788711234567")).rejects.toThrow()
  })
})

const loanBody = {
  id: "loan-1",
  material_id: "9788711234567",
  material_type: "ebook",
  start: "2026-08-01T10:00:00Z",
  end: "2026-08-31T10:00:00Z",
  active: true,
  title: "En bog",
  author: "Christie, Agatha",
  publisher: "Forlag",
  publish_date: "2014-11-07T00:00:00Z",
  license: { id: "lic-1", type: "selection" },
  // Fields the mapper does not consume must be tolerated.
  uid: "user-1",
  org_id: "org-1",
  lix: 24,
}

const mappedLoan = {
  loanId: "loan-1",
  materialId: "9788711234567",
  materialType: "ebook",
  startDate: "2026-08-01T10:00:00Z",
  endDate: "2026-08-31T10:00:00Z",
  active: true,
  title: "En bog",
  author: "Christie, Agatha",
  publisher: "Forlag",
  publishDate: "2014-11-07T00:00:00Z",
  loanProvider: "selection",
}

describe("createBiblioClient.getLoans", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches loans with query params and maps them", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ loans: [loanBody], pagination: { limit: 50, cursor: "next" } })
    )

    const result = await buildClient().getLoans({ active: true })

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/loans?active=true`,
      expect.objectContaining({ method: "GET" })
    )
    expect(result).toEqual({ loans: [mappedLoan], nextCursor: "next" })
  })

  it("omits the cursor on the final page", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ loans: [], pagination: { limit: 50 } })
    )

    await expect(buildClient().getLoans()).resolves.toEqual({
      loans: [],
      nextCursor: undefined,
    })
  })
})

describe("createBiblioClient.getLoanDecision", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches can-loan for the material and maps the status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ status: "loanable" }))

    const result = await buildClient().getLoanDecision("9788711234567")

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/loans/can-loan?material_id=9788711234567`,
      expect.objectContaining({ method: "GET" })
    )
    expect(result).toEqual({
      status: "loanable",
      unavailableReason: undefined,
      lendingBlockReason: undefined,
    })
  })

  it("throws on a material the adapter does not know", async () => {
    // The default: a 404 from can-loan is an error - asking about an unknown
    // material is normally a routing mistake worth hearing about.
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ message: "Material not found: 9788758855752" }, 404)
    )

    await expect(buildClient().getLoanDecision("9788758855752")).rejects.toThrow("404")
  })

  // TEMPORARY, with the toleration flag the option serves.
  it("resolves an unknown material to undefined when told to tolerate it", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ message: "Material not found: 9788758855752" }, 404)
    )

    await expect(
      buildClient().getLoanDecision("9788758855752", { allowNotFound: true })
    ).resolves.toBeUndefined()
  })

  it("maps the block reason when lending is blocked", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ status: "lending_blocked", lending_block_reason: "quarantined" })
    )

    await expect(buildClient().getLoanDecision("9788711234567")).resolves.toMatchObject({
      status: "lending_blocked",
      lendingBlockReason: "quarantined",
    })
  })

  it("throws on an unknown status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ status: "new_status" }))

    await expect(buildClient().getLoanDecision("9788711234567")).rejects.toThrow()
  })
})

describe("createBiblioClient.createLoan", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("posts the material id and maps the created loan", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ status: "loanable", loan: loanBody }))

    const result = await buildClient().createLoan("9788711234567")

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/loans`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ material_id: "9788711234567" }),
        headers: expect.objectContaining({ "content-type": "application/json" }),
      })
    )
    expect(result).toMatchObject({ status: "loanable", loan: mappedLoan })
  })

  it("returns no loan when the material could not be loaned", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ status: "concurrent_limit_exceeded" })
    )

    await expect(buildClient().createLoan("9788711234567")).resolves.toMatchObject({
      status: "concurrent_limit_exceeded",
      loan: undefined,
    })
  })
})

describe("createBiblioClient reservations", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("maps reservations including the offer fields", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({
        reservations: [
          {
            id: "res-1",
            material_id: "9788711234567",
            material_type: "audiobook",
            timestamp: "2026-08-01T10:00:00Z",
            loan_date: "2026-09-01T10:00:00Z",
            offer_id: "offer-1",
            offer_expires_at: "2026-08-20T10:00:00Z",
          },
        ],
        pagination: {},
      })
    )

    await expect(buildClient().getReservations()).resolves.toEqual({
      reservations: [
        {
          reservationId: "res-1",
          materialId: "9788711234567",
          materialType: "audiobook",
          createdDate: "2026-08-01T10:00:00Z",
          expectedLoanDate: "2026-09-01T10:00:00Z",
          offerId: "offer-1",
          offerExpiresAt: "2026-08-20T10:00:00Z",
        },
      ],
      nextCursor: undefined,
    })
  })

  it("deletes a reservation and returns the success flag", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ success: true }))

    await expect(buildClient().deleteReservation("res-1")).resolves.toBe(true)

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/reservations/res-1`,
      expect.objectContaining({ method: "DELETE" })
    )
  })

  it("accepts a reservation offer and returns the loan id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ success: true, loan_id: "loan-1" }))

    await expect(buildClient().acceptReservationOffer("offer-1")).resolves.toEqual({
      success: true,
      loanId: "loan-1",
    })

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/reservations/accept-offer`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ offer_id: "offer-1" }),
      })
    )
  })
})

describe("createBiblioClient user endpoints", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("maps combined and split loan quotas", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({
        loan_quotas: [
          {
            split_on_format: false,
            org_id: "org-1",
            org_name: "Herlev",
            combined_max_user_loans: 10,
            combined_max_concurrent_user_loans: 3,
            combined_current_concurrent_loans: 1,
            combined_current_monthly_loans: 2,
          },
          {
            split_on_format: true,
            org_id: "org-2",
            org_name: "Ballerup",
            max_user_loans: { ebook: 5, audiobook: 5 },
            max_concurrent_user_loans: { ebook: 2, audiobook: 2 },
            current_concurrent_loans: { ebook: 0, audiobook: 1 },
            current_monthly_loans: { ebook: 1, audiobook: 1 },
          },
        ],
      })
    )

    await expect(buildClient().getLoanQuotas()).resolves.toEqual([
      {
        splitOnFormat: false,
        orgId: "org-1",
        orgName: "Herlev",
        maxLoans: 10,
        maxConcurrentLoans: 3,
        currentConcurrentLoans: 1,
        currentMonthlyLoans: 2,
      },
      {
        splitOnFormat: true,
        orgId: "org-2",
        orgName: "Ballerup",
        maxLoans: { ebook: 5, audiobook: 5 },
        maxConcurrentLoans: { ebook: 2, audiobook: 2 },
        currentConcurrentLoans: { ebook: 0, audiobook: 1 },
        currentMonthlyLoans: { ebook: 1, audiobook: 1 },
      },
    ])
  })

  it("returns the support id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ support_id: "SUP-123" }))

    await expect(buildClient().getSupportId()).resolves.toBe("SUP-123")
  })

  it("creates a sign-in token for the reader/player SDK", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ token: "custom-token", expires_in_seconds: 3600 })
    )

    await expect(buildClient().createSignInToken()).resolves.toEqual({
      token: "custom-token",
      expiresInSeconds: 3600,
    })

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/auth/create-sign-in-token`,
      expect.objectContaining({ method: "POST" })
    )
  })
})
