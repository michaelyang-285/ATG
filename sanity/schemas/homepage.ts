export default {
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    {
      name: 'ticker',
      title: 'Breaking ticker items',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Short breaking news items shown in the yellow ticker bar',
    },
    {
      name: 'heroStory',
      title: 'Hero story',
      type: 'reference',
      to: [{ type: 'story' }],
      description: "Today's lead story",
    },
    {
      name: 'sidebarStories',
      title: 'Sidebar stories (Also today)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'story' }] }],
      validation: (Rule: any) => Rule.max(4),
    },
    {
      name: 'newsletterHeadline',
      title: 'Newsletter headline',
      type: 'string',
      initialValue: 'Gwinnett in 3 minutes. Every Thursday.',
    },
    {
      name: 'newsletterSub',
      title: 'Newsletter subtext',
      type: 'string',
      initialValue: 'No fluff. No tourism board energy. Just what actually happened.',
    },
    {
      name: 'subscriberCount',
      title: 'Subscriber count (social proof)',
      type: 'string',
      initialValue: '4,127 locals already subscribed',
    },
    {
      name: 'communityQuote',
      title: 'Community quote',
      type: 'string',
    },
    {
      name: 'communityQuoteSource',
      title: 'Quote source',
      type: 'string',
    },
  ],
  __experimental_actions: ['update', 'publish'],
}
