import { CharacterCountInput } from '../../studio/components/CharacterCountInput'

export default {
  name: 'story',
  title: 'Story',
  type: 'document',
  fields: [
    { name: 'title',       title: 'Headline',     type: 'string' },
    { name: 'deck',        title: 'Deck (subhead)', type: 'text', rows: 2 },
    { name: 'slug',        title: 'Slug',          type: 'slug', options: { source: 'title' } },
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
