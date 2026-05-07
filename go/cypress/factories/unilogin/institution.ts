import { Factory } from "fishery"

type InstitutionRestResponse = {
  INST_NR: string
  INST_NAVN: string
  INST_TYPE?: string
  KOMMUNE_NR?: number
  KOMMUNE?: string
}

export default Factory.define<InstitutionRestResponse>(() => ({
  INST_NR: "A04441",
  INST_NAVN: "DDF",
  INST_TYPE: "A04441",
}))
