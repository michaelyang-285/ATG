import { redirect } from 'next/navigation'

export default function EatArticleAliasPage({ params }: { params: { slug: string } }) {
  redirect(`/stories/${params.slug}`)
}
