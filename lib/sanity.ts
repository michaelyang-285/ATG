import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'YOUR_PROJECT_ID',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

// GROQ queries — one place for all data fetching
export const queries = {

  homepage: `*[_type == "homepage"][0]{
    heroStory->{
      title, deck, slug, readTime, publishedAt, author,
      "thumb": thumbnail.asset->url,
      "photoCredit": photoCredit,
      "category": category->{ name, color }
    },
    sidebarStories[]->{
      title, slug, publishedAt,
      "thumb": thumbnail.asset->url,
      "category": category->{ name }
    },
    newsletterHeadline,
    newsletterSub,
    subscriberCount,
    communityQuote,
    communityQuoteSource,
  }`,

  latestStories: `*[_type == "story"] | order(publishedAt desc)[0...8]{
    title, deck, slug, publishedAt, readTime,
    "category": category->{ name, color },
    "thumb": thumbnail.asset->url,
    location
  }`,

  upcomingEvents: `*[_type == "event" && date >= now()] | order(date asc)[0...5]{
    name, date, location, price, slug
  }`,

  gwinnettLists: `*[_type == "list"] | order(order asc)[0...6]{
    title, subtitle, slug, order
  }`,

  newBusinesses: `*[_type == "business"] | order(openedAt desc)[0...3]{
    name, businessType, location, description, status, slug
  }`,
}
