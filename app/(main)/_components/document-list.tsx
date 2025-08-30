'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'
import type { Doc, Id } from '@/convex/_generated/dataModel'

type DocumentListProps = {
  parentDocumentId?: Id<'documents'>
  skeletonCount?: number
}

export default function DocumentList({ parentDocumentId, skeletonCount = 6 }: DocumentListProps) {
  const router = useRouter()

  const createDoc = useMutation(api.documents.create)
  const documents = useQuery(api.documents.getSidebar, parentDocumentId ? { parentDocument: parentDocumentId } : {}) as
    | Doc<'documents'>[]
    | undefined

  const onCreate = async () => {
    const id = await createDoc({
      title: 'Untitled',
      parentDocument: parentDocumentId,
    })
    router.push(`/documents/${id}`)
  }

  if (!documents) {
    return (
      <ul className="flex flex-col divide-y border rounded-md overflow-hidden">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={i} className="p-3">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-3 w-2/3 rounded bg-muted/70 animate-pulse" />
          </li>
        ))}
      </ul>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-6 border rounded-md text-sm flex flex-col items-start gap-3">
        <p className="text-muted-foreground">No documents yet.</p>
        <button
          onClick={onCreate}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
        >
          Create your first document
        </button>
      </div>
    )
  }

  return (
    <ul className="flex flex-col divide-y border rounded-md overflow-hidden">
      {documents.map((doc: Doc<'documents'>) => (
        <li key={doc._id}>
          <Link
            href={`/documents/${doc._id}`}
            className={cn(
              'block px-4 py-3 hover:bg-muted transition-colors',
              doc.isPublished && 'font-medium text-foreground'
            )}
          >
            {doc.title || 'Untitled'}
          </Link>
        </li>
      ))}
    </ul>
  )
}
