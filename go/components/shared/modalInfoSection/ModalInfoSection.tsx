import React from "react"

// Info box for modal content — same shell as the work page's InfoBox:
// overlay background, heading title and wysiwyg-styled body copy.
const ModalInfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="bg-background-overlay rounded-base p-grid-edge w-full space-y-4 md:p-8">
    <h2 className="text-typo-heading-5 max-w-prose">{title}</h2>
    <div className="wysiwyg max-w-prose">{children}</div>
  </section>
)

export default ModalInfoSection
