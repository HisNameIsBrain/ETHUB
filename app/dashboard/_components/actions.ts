// app/dashboard/_components/actions.ts
'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { revalidatePath } from 'next/cache';

/** Convert string into Convex Id<'services'> */
function asServiceId(id: string | Id<'services'>): Id<'services'> {
  return id as Id<'services'>;
}

/** Delete by id (string or Id<'services'>) */
export async function deleteServiceById(id: string | Id<'services'>, opts?: { revalidate?: string }) {
  await fetchMutation(api.services.remove, { id: asServiceId(id) });
  if (opts?.revalidate) revalidatePath(opts.revalidate);
}

/** Form action for <form action={deleteServiceAction}> usage */
export async function deleteServiceAction(formData: FormData) {
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) throw new Error('Missing \"id\"');
  await fetchMutation(api.services.remove, { id: asServiceId(id) });
  revalidatePath('/dashboard/services'); // adjust as needed
}
