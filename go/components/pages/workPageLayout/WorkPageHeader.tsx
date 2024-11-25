import React from "react"

import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import { displayCreators } from "@/components/shared/workCard/helper"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import { getManifestationByMaterialType, getWorkMaterialTypes } from "./helper"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
}

const WorkPageHeader = ({ work }: WorkPageHeaderProps) => {
  const { setSelectedManifestation } = useSelectedManifestationStore()
  const slideSelectOptions = getWorkMaterialTypes(work).map(materialType => {
    return { value: materialType.code, render: materialType.display }
  })

  return (
    <div className="mt-5">
      <div className="relative mx-auto flex h-full w-[70vw] items-center">
        <CoverPicture
          alt="xyz"
          lowResSrc="https://res.cloudinary.com/dandigbib/image/upload/t_ddb_cover/v1687586796/publizon/9788770683180.jpg"
          src="https://res.cloudinary.com/dandigbib/image/upload/t_ddb_cover/v1687586796/publizon/9788770683180.jpg"
        />
      </div>

      <div className="mt-12 flex w-full justify-center">
        <SlideSelect
          options={slideSelectOptions}
          onOptionSelect={(optionSelected: SlideSelectOption) => {
            setSelectedManifestation(
              getManifestationByMaterialType(work, optionSelected.value) ||
                work.manifestations.bestRepresentation
            )
          }}
        />
      </div>
      <h1 className="mt-8 text-typo-heading-3">{work.titles.full}</h1>
      <p className="mt-2 text-typo-caption uppercase">{`af ${displayCreators(work.creators, 100)}`}</p>
    </div>
  )
}

export default WorkPageHeader
