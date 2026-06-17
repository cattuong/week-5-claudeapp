type Props = {
  label: string
  value: string | number | null
  sub?: string
  loading?: boolean
}

export default function KpiCard({ label, value, sub, loading }: Props) {
  return (
    <div className="bg-an-bg-surface border border-an-border rounded-lg p-4">
      <p className="text-[11px] text-an-fg-muted uppercase tracking-wide mb-2">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-an-bg-elevated rounded animate-pulse mb-1" />
      ) : (
        <p className="text-[24px] font-medium text-an-fg-base leading-none mb-1">
          {value === null || value === undefined ? '--' : value}
        </p>
      )}
      {sub && <p className="text-[12px] text-an-fg-subtle">{sub}</p>}
    </div>
  )
}
