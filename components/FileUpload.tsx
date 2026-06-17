'use client'

import { RefObject } from 'react'

type Props = {
  inputRef: RefObject<HTMLInputElement>
  onFileLoaded: (text: string, filename: string, previewUrl: string, fileType: string) => void
}

export default function FileUpload({ inputRef, onFileLoaded }: Props) {
  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!e.target) return
    e.target.value = ''
    if (!file) return

    const { type, name } = file
    const MAX_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_SIZE) {
      alert('File is too large. Maximum size is 20MB.')
      return
    }

    if (type === 'application/pdf') {
      const blobUrl = URL.createObjectURL(file)
      const arrayBuffer = await file.arrayBuffer()
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      const pdf = await getDocument({ data: arrayBuffer }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n'
      }
      onFileLoaded(text, name, blobUrl, type)
    } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer()
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ arrayBuffer })
      onFileLoaded(result.value, name, '', type)
    } else {
      alert('Only PDF and DOCX files are supported.')
    }
  }

  return (
    <input
      ref={inputRef}
      type="file"
      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      onChange={handleChange}
      className="hidden"
    />
  )
}
