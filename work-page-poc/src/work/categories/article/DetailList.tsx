import type { DetailRow } from "./articleText"

/** Label/value rows, as in the artifact's "Detaljer om materialet". */
export const DetailList = ({ rows }: { rows: DetailRow[] }) => (
  <dl className="m-0 px-4 pt-3 pb-6 lg:max-w-[760px] lg:px-6 lg:pt-4 lg:pb-8">
    {rows.map((row) => (
      <div key={row.label} className="flex gap-4 border-b border-outline py-[11px]">
        <dt className="w-[110px] shrink-0 text-body-s text-text-inactive lg:w-[200px]">{row.label}</dt>
        <dd className="m-0 text-body-m">{row.value}</dd>
      </div>
    ))}
  </dl>
)
