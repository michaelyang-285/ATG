import { redirect } from 'next/navigation'

export default function GuideArticleAliasPage({ params }: { params: { slug: string } }) {
  redirect(`/stories/${params.slug}`)
}
