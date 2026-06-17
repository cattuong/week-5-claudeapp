type Props = {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-an-bg-elevated border border-an-border rounded-lg p-4 w-56 shadow-lg an-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[13px] text-an-fg-base mb-1">{title}</p>
        <p className="text-[12px] text-an-fg-muted mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="h-7 px-3 rounded border border-an-border text-[12px] text-an-fg-subtle hover:text-an-fg-base transition duration-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-7 px-3 rounded text-[12px] font-medium transition duration-100"
            style={{ backgroundColor: 'rgba(192,91,91,0.15)', color: 'var(--an-error)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
