"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import HelpFromAdultSection from "@/components/shared/helpFromAdultSection/HelpFromAdultSection"
import ModalInfoSection from "@/components/shared/modalInfoSection/ModalInfoSection"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { formatAmount } from "@/lib/helpers/helper.fees"

// Data props — `open`/`onClose` come from the DynamicModal host. Both values
// cover overdue-type fees only — compensations for lost/damaged materials are
// explained by CompensationModal instead.
export type FeesModalProps = {
  // Materials returned late, driving the intro copy.
  lateMaterialCount: number
  lateFeeTotal: number
}

// Explains unpaid overdue fees in child-friendly terms: what happened, that
// the guardians have been notified, and why fees exist.
const FeesModal = ({
  open,
  onClose,
  lateMaterialCount,
  lateFeeTotal,
}: FeesModalProps & { open: boolean; onClose: () => void }) => (
  <ResponsiveDialog open={open} onClose={onClose} title="Gebyrer">
    <div data-cy={cyKeys["fees-modal"]} className="w-full justify-center space-y-8">
      <div className="mx-auto max-w-prose space-y-4 text-center">
        <p className="text-typo-subtitle-sm text-foreground-muted">
          {`Ups! Du har afleveret ${lateMaterialCount} ${
            lateMaterialCount === 1 ? "bog" : "bøger"
          } for sent på biblioteket.`}
        </p>
        <h2 className="text-typo-heading-5">
          {`Derfor mangler der at blive betalt ${formatAmount(lateFeeTotal)} kr.`}
        </h2>
      </div>

      <HelpFromAdultSection />

      <ModalInfoSection title="Hvorfor koster det penge?">
        <p>
          Når man låner bøger nede på biblioteket, skal man aflevere dem til tiden, så andre kan
          låne dem.
        </p>
        <p>
          Hvis man ikke afleverer bøgerne til tiden, skal man betale et gebyr.
          <br />
          E-bøger, lydbøger og podcasts afleverer sig selv. Dem skal du ikke bekymre dig om.
        </p>
      </ModalInfoSection>
    </div>

    <ResponsiveDialog.Actions>
      <Button theme="primary" size="lg" onClick={onClose}>
        Luk
      </Button>
    </ResponsiveDialog.Actions>
  </ResponsiveDialog>
)

export default FeesModal
