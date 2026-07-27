"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import HelpFromAdultSection from "@/components/shared/helpFromAdultSection/HelpFromAdultSection"
import ModalInfoSection from "@/components/shared/modalInfoSection/ModalInfoSection"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { formatAmount } from "@/lib/helpers/helper.fees"

// Data props — `open`/`onClose` come from the DynamicModal host. Both values
// cover compensation-type fees only (lost/damaged materials) — overdue fees
// are explained by FeesModal instead.
export type CompensationModalProps = {
  // Materials the compensation covers — FBS doesn't say whether they were
  // lost, damaged or billed after long overdue.
  compensationMaterialCount: number
  compensationTotal: number
}

// Explains compensation for lost or damaged materials in child-friendly
// terms, mirroring the fees modal.
const CompensationModal = ({
  open,
  onClose,
  compensationMaterialCount,
  compensationTotal,
}: CompensationModalProps & { open: boolean; onClose: () => void }) => (
  <ResponsiveDialog open={open} onClose={onClose} title="Erstatning">
    <div data-cy={cyKeys["compensation-modal"]} className="w-full justify-center space-y-8">
      <div className="mx-auto max-w-prose space-y-4 text-center">
        {/* FBS doesn't say why the compensation was charged (lost, damaged
            or just billed after long overdue), so the copy only states that
            it covers these materials. */}
        <p className="text-typo-subtitle-sm text-foreground-muted">
          {`Ups! Du skal betale erstatning for ${compensationMaterialCount} ${
            compensationMaterialCount === 1 ? "bog" : "bøger"
          } fra biblioteket.`}
        </p>
        <h2 className="text-typo-heading-5">
          {`Der mangler at blive betalt ${formatAmount(compensationTotal)} kr.`}
        </h2>
      </div>

      <HelpFromAdultSection />

      <ModalInfoSection title="Hvorfor koster det penge?">
        <p>
          Når man låner en bog, lover man at passe godt på den og aflevere den igen, så andre også
          kan låne den.
        </p>
        <p>
          Hvis en bog bliver væk, går i stykker eller ikke bliver afleveret, skal biblioteket købe
          en ny. Derfor skal man betale erstatning.
        </p>
        <p>Har du stadig bogen? Så aflevér den på biblioteket og spørg personalet om regningen.</p>
      </ModalInfoSection>
    </div>

    <ResponsiveDialog.Actions>
      <Button theme="primary" size="lg" onClick={onClose}>
        Luk
      </Button>
    </ResponsiveDialog.Actions>
  </ResponsiveDialog>
)

export default CompensationModal
