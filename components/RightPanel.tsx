'use client'

import { Circle, Loader2, CheckCircle2, XCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'

type StepStatus = 'pending' | 'active' | 'done' | 'error'
type ExecutionStep = { label: string; status: StepStatus }

type Props = {
  previewUrl: string
  filename: string
  fileType: string
  docxText: string
  isConnected: boolean
  executionSteps: ExecutionStep[]
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'pending') return <Circle size={14} strokeWidth={1.5} className="text-an-fg-muted flex-shrink-0" />
  if (status === 'active') return <Loader2 size={14} strokeWidth={1.5} className="text-an-accent flex-shrink-0 animate-spin" />
  if (status === 'done') return <CheckCircle2 size={14} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--an-success)' }} />
  return <XCircle size={14} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--an-error)' }} />
}

function ExecutionStepsPanel({ steps }: { steps: ExecutionStep[] }) {
  if (steps.length === 0) return null
  return (
    <div className="p-4 border-t border-an-border">
      <p className="text-[10px] uppercase tracking-wide text-an-fg-muted mb-3">Processing steps</p>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <StepIcon status={step.status} />
            <span className={`text-[13px] ${
              step.status === 'error' ? 'text-[var(--an-error)]' :
              step.status === 'done' || step.status === 'active' ? 'text-an-fg-base' :
              'text-an-fg-muted'
            }`}>
              {step.label}
            </span>
            {step.status === 'active' && (
              <Loader2 size={11} strokeWidth={1.5} className="ml-auto text-an-accent animate-spin" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const STATUS_CHECKLIST = [
  'Log in',
  'Connect Microsoft account',
  'Start a new chat',
  'Upload a document',
  'Ask a question',
]

export default function RightPanel({ previewUrl, filename, fileType, docxText, isConnected, executionSteps }: Props) {
  const isRequestInFlight = executionSteps.length > 0
  const isPdf = fileType === 'application/pdf' && previewUrl
  const isDocx = fileType === DOCX_MIME && filename

  // Mode D: request in flight — full panel is execution steps
  if (isRequestInFlight) {
    return (
      <aside className="w-[304px] flex-shrink-0 bg-an-bg-subtle border-l border-an-border flex flex-col h-full">
        <div className="p-4 border-b border-an-border">
          <p className="text-[12px] font-medium text-an-fg-base">Processing</p>
          <p className="text-[11px] text-an-fg-muted">AI is analysing your document</p>
        </div>
        <div className="flex-1 p-4">
          <div className="flex flex-col gap-3">
            {executionSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <StepIcon status={step.status} />
                <span className={`text-[13px] ${
                  step.status === 'error' ? 'text-[var(--an-error)]' :
                  step.status === 'done' || step.status === 'active' ? 'text-an-fg-base' :
                  'text-an-fg-muted'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  // Mode B: PDF loaded
  if (isPdf) {
    return (
      <aside className="w-[304px] flex-shrink-0 bg-an-bg-subtle border-l border-an-border flex flex-col h-full">
        <div className="p-4 border-b border-an-border">
          <p className="text-[12px] font-medium text-an-fg-base truncate">{filename}</p>
          <p className="text-[11px] text-an-fg-muted">PDF preview</p>
        </div>
        <iframe src={previewUrl} className="flex-1 w-full" title="PDF preview" />
        <ExecutionStepsPanel steps={executionSteps} />
      </aside>
    )
  }

  // Mode C: DOCX loaded
  if (isDocx) {
    return (
      <aside className="w-[304px] flex-shrink-0 bg-an-bg-subtle border-l border-an-border flex flex-col h-full">
        <div className="p-4 border-b border-an-border">
          <p className="text-[12px] font-medium text-an-fg-base truncate">{filename}</p>
          <p className="text-[11px] text-an-fg-muted">Document preview</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="font-mono text-[12px] text-an-fg-subtle leading-relaxed whitespace-pre-wrap break-words">
            {docxText || '(No text extracted from document)'}
          </pre>
          {docxText.length >= 4000 && (
            <p className="text-[11px] text-an-fg-muted mt-3 italic">… preview truncated at 4,000 characters</p>
          )}
        </div>
        <ExecutionStepsPanel steps={executionSteps} />
      </aside>
    )
  }

  // Mode A: default status checklist
  const checklist = [true, isConnected, false, !!filename, false]

  return (
    <aside className="w-[304px] flex-shrink-0 bg-an-bg-subtle border-l border-an-border flex flex-col h-full">
      <div className="flex flex-col h-full p-4 gap-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-wide text-an-fg-muted">Status</p>
            {isConnected
              ? <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--an-success)' }}><Wifi size={12} strokeWidth={1.5} />Connected</span>
              : <span className="flex items-center gap-1 text-[11px] text-an-fg-muted"><WifiOff size={12} strokeWidth={1.5} />Not connected</span>
            }
          </div>
          <div className="flex flex-col gap-2">
            {STATUS_CHECKLIST.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {checklist[i]
                  ? <CheckCircle size={14} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--an-success)' }} />
                  : <Circle size={14} strokeWidth={1.5} className="text-an-fg-muted flex-shrink-0" />
                }
                <span className={`text-[13px] ${checklist[i] ? 'text-an-fg-base' : 'text-an-fg-muted'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {!isConnected && (
          <a
            href="/api/auth/microsoft"
            className="block h-9 flex items-center justify-center rounded-md border border-an-border text-[13px] text-an-fg-base hover:bg-an-bg-surface transition duration-150 text-center"
          >
            Connect Microsoft account
          </a>
        )}

        {filename && (
          <div className="bg-an-bg-surface rounded-lg p-3 border border-an-border">
            <p className="text-[11px] text-an-fg-muted mb-1">Loaded document</p>
            <p className="text-[13px] text-an-fg-base truncate">{filename}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
