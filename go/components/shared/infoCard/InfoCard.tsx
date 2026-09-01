import React from "react"

import Icon from "@/components/shared/icon/Icon"

type InfoCardProps = {
  icon: string
  title: string
  value: string
}

const InfoCard = ({ icon, title, value }: InfoCardProps) => (
  <div className="bg-background-skeleton/40 rounded-base flex items-center gap-4 px-6 py-4">
    <Icon name={icon} className="text-foreground h-7 w-7 shrink-0" />
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-typo-subtitle-sm font-medium">{title}</p>
      <p className="text-typo-subtitle-sm text-foreground-muted break-words">{value}</p>
    </div>
  </div>
)

export default InfoCard
