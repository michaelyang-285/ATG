import { client, queries } from '@/lib/sanity'
import Nav from '@/components/Nav'
import Ticker from '@/components/Ticker'
import Hero from '@/components/Hero'
import NewsletterStrip from '@/components/NewsletterStrip'
import CategoryBar from '@/components/CategoryBar'
import { StoryFeed, Rail } from '@/components/ContentGrid'
import { BusinessSpotlight, PromoBar, Footer } from '@/components/Misc'

export const revalidate = 60

async function getData() {
  try {
    const [homepage, stories, events, lists, businesses] = await Promise.all([
      client.fetch(queries.homepage),
      client.fetch(queries.latestStories),
      client.fetch(queries.upcomingEvents),
      client.fetch(queries.gwinnettLists),
      client.fetch(queries.newBusinesses),
    ])
    return { homepage, stories, events, lists, businesses }
  } catch {
    return { homepage: null, stories: [], events: [], lists: [], businesses: [] }
  }
}

export default async function HomePage() {
  const { homepage, stories, events, lists, businesses } = await getData()

  return (
    <main className="w-full">
      <Nav />
      <Ticker items={homepage?.ticker ?? []} />
      <Hero heroStory={homepage?.heroStory} sidebarStories={homepage?.sidebarStories ?? []} />
      <NewsletterStrip headline={homepage?.newsletterHeadline} sub={homepage?.newsletterSub} subscriberCount={homepage?.subscriberCount} />
      <CategoryBar />
      {homepage?.communityQuote && (
        <div className="bg-yellow border-b-2 border-ink w-full">
          <div className="max-w-[1200px] mx-auto px-6 py-[14px]">
            <p className="font-inter text-[8px] font-bold uppercase tracking-[1.5px] text-black/35 mb-[6px]">From the group</p>
            <p className="font-archivo text-[17px] text-ink leading-[1.2] tracking-[-0.3px]">"{homepage.communityQuote}"</p>
            <p className="font-inter text-[10px] text-black/40 mt-[6px]">{homepage.communityQuoteSource}</p>
          </div>
        </div>
      )}
      <div className="bg-paper border-b-2 border-ink w-full">
        <div className="max-w-[1200px] mx-auto grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <StoryFeed stories={stories} />
          <Rail events={events} lists={lists} />
        </div>
      </div>
      <BusinessSpotlight businesses={businesses} />
      <PromoBar />
      <Footer />
    </main>
  )
}
