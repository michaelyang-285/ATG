import { CharacterCountInput } from '../../studio/components/CharacterCountInput'

export const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'name',  title: 'Name',  type: 'string' },
    {
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          { title: 'Orange (Food & drink)',   value: 'orange' },
          { title: 'Yellow (Roads)',           value: 'yellow' },
          { title: 'Ink (Business)',           value: 'ink' },
          { title: 'Mid (Development)',        value: 'mid' },
          { title: 'Outline (Community)',      value: 'outline' },
        ],
      },
    },
  ],
}

export const event = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    { name: 'name',     title: 'Event name', type: 'string' },
    { name: 'date',     title: 'Date',       type: 'datetime' },
    { name: 'location', title: 'Location',   type: 'string' },
    { name: 'price',    title: 'Price',      type: 'string', description: 'e.g. Free, $5' },
    { name: 'slug',     title: 'Slug',       type: 'slug', options: { source: 'name' } },
  ],
}

export const list = {
  name: 'list',
  title: 'Gwinnett List',
  type: 'document',
  fields: [
    { name: 'title',    title: 'Title',    type: 'string' },
    { name: 'subtitle', title: 'Subtitle', type: 'string' },
    { name: 'order',    title: 'Order',    type: 'number' },
    { name: 'slug',     title: 'Slug',     type: 'slug', options: { source: 'title' } },
  ],
}

export const business = {
  name: 'business',
  title: 'Business',
  type: 'document',
  fields: [
    { name: 'name', title: 'Business name', type: 'string', validation: (Rule: any) => Rule.required() },
    {
      name: 'businessType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Restaurants & Food', value: 'restaurants-food' },
          { title: 'Automotive', value: 'automotive' },
          { title: 'Home Repair & Maintenance', value: 'home-repair-maintenance' },
          { title: 'Health & Wellness', value: 'health-wellness' },
          { title: 'Beauty & Personal Care', value: 'beauty-personal-care' },
          { title: 'Retail & Shopping', value: 'retail-shopping' },
          { title: 'Pet Care', value: 'pet-care' },
          { title: 'Real Estate', value: 'real-estate' },
          { title: 'Legal & Financial', value: 'legal-financial' },
          { title: 'Education & Tutoring', value: 'education-tutoring' },
          { title: 'Events & Entertainment', value: 'events-entertainment' },
          { title: 'Technology & IT', value: 'technology-it' },
          { title: 'Community & Religious Organizations', value: 'community-religious-organizations' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    { name: 'address1', title: 'Address 1', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'address2', title: 'Address 2 (Suite, Unit, etc.)', type: 'string' },
    { name: 'city', title: 'City', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'state', title: 'State', type: 'string', validation: (Rule: any) => Rule.required().length(2) },
    { name: 'zip', title: 'ZIP', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'description', title: 'Description', type: 'text', rows: 4, validation: (Rule: any) => Rule.required() },
    {
      name: 'hours',
      title: 'Business hours',
      type: 'object',
      fields: [
        { name: 'sunday', title: 'Sunday', type: 'string', initialValue: 'Closed' },
        { name: 'monday', title: 'Monday', type: 'string' },
        { name: 'tuesday', title: 'Tuesday', type: 'string' },
        { name: 'wednesday', title: 'Wednesday', type: 'string' },
        { name: 'thursday', title: 'Thursday', type: 'string' },
        { name: 'friday', title: 'Friday', type: 'string' },
        { name: 'saturday', title: 'Saturday', type: 'string' },
      ],
    },
    {
      name: 'googleMapsUrl',
      title: 'Google Maps link',
      type: 'url',
      validation: (Rule: any) =>
        Rule.uri({ scheme: ['http', 'https'] }).custom((value: string) => {
          if (!value) return true
          if (!value.includes('google.com/maps') && !value.includes('maps.app.goo.gl')) {
            return 'Use a Google Maps URL.'
          }
          return true
        }),
    },
    { name: 'website', title: 'Website URL', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
    { name: 'x', title: 'X URL', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
    { name: 'facebook', title: 'Facebook URL', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
    { name: 'instagram', title: 'Instagram URL', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
    { name: 'tiktok', title: 'TikTok URL', type: 'url', validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }) },
    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'galleryImages',
      title: 'Gallery images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule: any) => Rule.max(20),
    },
    {
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Aim for 50-60 characters.',
      options: { maxLength: 60, recommendedRange: '50-60' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => Rule.max(60),
    },
    {
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Aim for 120-155 characters.',
      options: { maxLength: 155, recommendedRange: '120-155' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => Rule.max(155),
    },
    {
      name: 'ogTitle',
      title: 'OG title',
      type: 'string',
      description: 'Social share title. Aim for 40-60 characters.',
      options: { maxLength: 60, recommendedRange: '40-60' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => Rule.max(60),
    },
    {
      name: 'ogDescription',
      title: 'OG description',
      type: 'text',
      rows: 3,
      description: 'Social share description. Aim for 110-200 characters.',
      options: { maxLength: 200, recommendedRange: '110-200' },
      components: { input: CharacterCountInput },
      validation: (Rule: any) => Rule.max(200),
    },
    {
      name: 'status',
      title: 'Status (optional)',
      type: 'string',
      options: {
        list: [
          { title: 'Just opened',  value: 'opened' },
          { title: 'Coming soon',  value: 'soon' },
        ],
      },
    },
    { name: 'openedAt', title: 'Opened / Opening date (optional)', type: 'date' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (Rule: any) => Rule.required() },
  ],
  preview: {
    select: {
      title: 'name',
      type: 'businessType',
      city: 'city',
      media: 'mainImage',
    },
    prepare({ title, type, city, media }: any) {
      return {
        title: title || 'Untitled business',
        subtitle: [type, city].filter(Boolean).join(' · ') || 'Business',
        media,
      }
    },
  },
}

export const authorProfile = {
  name: 'authorProfile',
  title: 'Author Profile',
  type: 'document',
  fields: [
    { name: 'firstName', title: 'First name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'lastName', title: 'Last name', type: 'string', validation: (Rule: any) => Rule.required() },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      validation: (Rule: any) => Rule.required().min(40).max(500),
    },
    { name: 'businessName', title: 'Business name', type: 'string' },
    {
      name: 'profileImage',
      title: 'Profile photo (1:1, 500x500)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule: any) =>
        Rule.required().custom(async (value: any, context: any) => {
          if (!value?.asset?._ref) return true
          const client = context.getClient({ apiVersion: '2024-01-01' })
          const asset = await client.fetch(
            '*[_id == $id][0]{metadata{dimensions{width,height}}}',
            { id: value.asset._ref }
          )
          const width = asset?.metadata?.dimensions?.width
          const height = asset?.metadata?.dimensions?.height
          if (!width || !height) return 'Could not read image dimensions. Please re-upload.'
          if (width !== height) return 'Profile photo must be square (1:1 aspect ratio).'
          if (width < 500 || height < 500) return 'Profile photo must be at least 500x500.'
          return true
        }),
    },
    {
      name: 'website',
      title: 'Website URL',
      type: 'url',
      validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
      validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'facebook',
      title: 'Facebook URL',
      type: 'url',
      validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
      validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'x',
      title: 'X URL',
      type: 'url',
      validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
    },
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      businessName: 'businessName',
      media: 'profileImage',
    },
    prepare({ firstName, lastName, businessName, media }: any) {
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      return {
        title: fullName || 'Untitled author',
        subtitle: businessName || 'Author profile',
        media,
      }
    },
  },
}
