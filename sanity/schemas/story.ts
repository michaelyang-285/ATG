import { CharacterCountInput } from '../../studio/components/CharacterCountInput'

export default {
  name: 'story',
  title: 'Story',
  type: 'document',
  fields: [
    { name: 'title',       title: 'Headline',     type: 'string' },
    { name: 'deck',        title: 'Deck (subhead)', type: 'text', rows: 2 },
    { name: 'slug',        title: 'Slug',          type: 'slug', options: { source: 'title' } },
    {
      name: 'storyType',
      title: 'Story type',
      description: 'Use Local Story for coverage/features and Guide for list/explainer utility content.',
      type: 'string',
      options: {
        list: [
          { title: 'Local Story', value: 'localStory' },
          { title: 'Guide', value: 'guide' },
        ],
      },
      initialValue: 'localStory',
    },
    { name: 'publishedAt', title: 'Published at',  type: 'datetime' },
    { name: 'readTime',    title: 'Read time (mins)', type: 'number' },
    { name: 'location',    title: 'Location',      type: 'string' },
    { name: 'author',      title: 'Author (legacy text)',        type: 'string', initialValue: 'ATG Staff' },
    {
      name: 'authorProfile',
      title: 'Author profile',
      description: 'Select an author profile for richer bylines and author pages.',
      type: 'reference',
      to: [{ type: 'authorProfile' }],
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail image',
      type: 'image',
      options: { hotspot: true },
    },
    { name: 'photoCredit', title: 'Photo credit', type: 'string' },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
        {
          name: 'pullQuote',
          title: 'Pull quote',
          type: 'object',
          fields: [
            { name: 'text', title: 'Quote text', type: 'text', rows: 3 },
            { name: 'attribution', title: 'Attribution', type: 'string' },
          ],
        },
        {
          name: 'callout',
          title: 'Callout',
          type: 'object',
          fields: [
            { name: 'heading', title: 'Heading', type: 'string' },
            {
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Note', value: 'note' },
                  { title: 'Key takeaway', value: 'takeaway' },
                  { title: 'If you go', value: 'ifYouGo' },
                  { title: 'Warning', value: 'warning' },
                  { title: "Editor's note", value: 'editorsNote' },
                ],
              },
              initialValue: 'note',
            },
            {
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [{ type: 'block' }],
            },
          ],
        },
        {
          name: 'tldr',
          title: 'TLDR / At a glance',
          type: 'object',
          fields: [
            { name: 'heading', title: 'Heading', type: 'string' },
            {
              name: 'points',
              title: 'Points',
              type: 'array',
              of: [{ type: 'string' }],
              validation: (Rule: any) => Rule.min(2).max(8),
            },
          ],
        },
        {
          name: 'faq',
          title: 'FAQ',
          type: 'object',
          fields: [
            { name: 'heading', title: 'Heading', type: 'string' },
            {
              name: 'items',
              title: 'Questions',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'question', title: 'Question', type: 'string', validation: (Rule: any) => Rule.required() },
                    { name: 'answer', title: 'Answer', type: 'array', of: [{ type: 'block' }] },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'editorsNote',
          title: "Editor's note",
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text', rows: 3 },
          ],
        },
        {
          name: 'correction',
          title: 'Correction',
          type: 'object',
          fields: [
            { name: 'correctedAt', title: 'Corrected at', type: 'datetime' },
            { name: 'body', title: 'Correction text', type: 'text', rows: 3 },
          ],
        },
        {
          name: 'divider',
          title: 'Divider',
          type: 'object',
          fields: [
            {
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Rule', value: 'rule' },
                  { title: 'Dots', value: 'dots' },
                  { title: 'ATG', value: 'atg' },
                ],
              },
              initialValue: 'rule',
            },
          ],
        },
        {
          name: 'videoEmbed',
          title: 'Video embed',
          type: 'object',
          fields: [
            { name: 'url', title: 'Video URL', type: 'url', validation: (Rule: any) => Rule.required() },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
        {
          name: 'socialEmbed',
          title: 'Social embed',
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'X', value: 'twitter' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'TikTok', value: 'tiktok' },
                ],
              },
            },
            { name: 'url', title: 'Post URL', type: 'url', validation: (Rule: any) => Rule.required() },
            { name: 'authorName', title: 'Author name', type: 'string' },
            { name: 'authorHandle', title: 'Author handle', type: 'string' },
            { name: 'content', title: 'Quoted content', type: 'text', rows: 4 },
            { name: 'mediaUrl', title: 'Media image URL (optional)', type: 'url' },
            { name: 'postedAt', title: 'Posted at', type: 'datetime' },
          ],
        },
        {
          name: 'mapEmbed',
          title: 'Map embed',
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'address', title: 'Address', type: 'string' },
            { name: 'query', title: 'Search query', type: 'string' },
            { name: 'lat', title: 'Latitude', type: 'number' },
            { name: 'lng', title: 'Longitude', type: 'number' },
            { name: 'zoom', title: 'Zoom', type: 'number', initialValue: 15 },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
        {
          name: 'gallery',
          title: 'Gallery',
          type: 'object',
          fields: [
            {
              name: 'columns',
              title: 'Columns',
              type: 'number',
              options: { list: [2, 3] },
              initialValue: 2,
            },
            {
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    { name: 'alt', title: 'Alt text', type: 'string' },
                    { name: 'caption', title: 'Caption', type: 'string' },
                    { name: 'credit', title: 'Credit', type: 'string' },
                  ],
                },
              ],
              validation: (Rule: any) => Rule.min(2),
            },
          ],
        },
        {
          name: 'relatedStoryRef',
          title: 'Related story card',
          type: 'object',
          fields: [
            { name: 'story', title: 'Story', type: 'reference', to: [{ type: 'story' }], validation: (Rule: any) => Rule.required() },
          ],
        },
        {
          name: 'businessRef',
          title: 'Business card',
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'business', title: 'Business', type: 'reference', to: [{ type: 'business' }], validation: (Rule: any) => Rule.required() },
          ],
        },
        {
          name: 'eventRef',
          title: 'Event card',
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'event', title: 'Event', type: 'reference', to: [{ type: 'event' }], validation: (Rule: any) => Rule.required() },
          ],
        },
      ],
    },
    {
      name: 'relatedStories',
      title: 'Related stories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'story' }] }],
      validation: (Rule: any) => Rule.max(3),
    },
    {
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Used for search results. Aim for 50-60 characters.',
      options: { maxLength: 60, recommendedRange: '50-60' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => [
        Rule.max(60).error('SEO title should be 60 characters or fewer.'),
        Rule.custom((value: string) => {
          if (!value) return true
          if (value.length < 50) return 'Consider 50-60 characters for best SEO display.'
          return true
        }).warning(),
      ],
    },
    {
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Meta description shown in search snippets. Aim for 120-155 characters.',
      options: { maxLength: 155, recommendedRange: '120-155' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => [
        Rule.max(155).error('SEO description should be 155 characters or fewer.'),
        Rule.custom((value: string) => {
          if (!value) return true
          if (value.length < 120) return 'Consider 120-155 characters for stronger search snippets.'
          return true
        }).warning(),
      ],
    },
    {
      name: 'ogTitle',
      title: 'OG title',
      type: 'string',
      description: 'Social sharing headline (Facebook/LinkedIn/etc). Aim for 40-60 characters.',
      options: { maxLength: 60, recommendedRange: '40-60' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => [
        Rule.max(60).error('OG title should be 60 characters or fewer.'),
        Rule.custom((value: string) => {
          if (!value) return true
          if (value.length < 40) return 'Consider 40-60 characters for social previews.'
          return true
        }).warning(),
      ],
    },
    {
      name: 'ogDescription',
      title: 'OG description',
      type: 'text',
      rows: 3,
      description: 'Social sharing description. Aim for 110-200 characters.',
      options: { maxLength: 200, recommendedRange: '110-200' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => [
        Rule.max(200).error('OG description should be 200 characters or fewer.'),
        Rule.custom((value: string) => {
          if (!value) return true
          if (value.length < 110) return 'Consider 110-200 characters for social previews.'
          return true
        }).warning(),
      ],
    },
  ],
  preview: {
    select: { title: 'title', category: 'category.name', media: 'thumbnail' },
    prepare({ title, category, media }) {
      return { title, subtitle: category, media }
    },
  },
}
