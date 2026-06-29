"use client"

import React from "react"

import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { cyKeys } from "@/cypress/support/constants"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"

type Props = {
  cover: Cover
}

const DeleteReservationReceiptContent = ({ cover }: Props) => (
  <div
    data-cy={cyKeys["delete-reservation-receipt"]}
    className="mx-auto flex max-w-prose flex-col items-center gap-y-8 text-center">
    <ManifestationCover cover={cover} iconName="book" className="aspect-[4/5] w-32 shrink-0" />
    <p className="text-typo-heading-5">Din reservering er nu slettet</p>
  </div>
)

export default DeleteReservationReceiptContent
