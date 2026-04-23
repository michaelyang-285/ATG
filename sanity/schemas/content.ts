import { CharacterCountInput } from '../../studio/components/CharacterCountInput'

const BUSINESS_TYPE_SEGMENTS: Record<string, string> = {
  'restaurants-food': 'restaurants',
  automotive: 'auto',
  'home-repair-maintenance': 'home-repair',
  'health-wellness': 'health',
  'beauty-personal-care': 'beauty',
  'retail-shopping': 'shopping',
  'pet-care': 'pets',
  'real-estate': 'real-estate',
  'legal-financial': 'legal-finance',
  'education-tutoring': 'education',
  'events-entertainment': 'events',
  'technology-it': 'tech',
  'community-religious-organizations': 'community',
  other: 'other',
}

function toKebab(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s/-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^[-/]+|[-/]+$/g, '')
}

function businessSlugSource(doc: any) {
  const typeSegment = BUSINESS_TYPE_SEGMENTS[doc?.businessType || ''] || 'other'
  const nameSegment = doc?.name || ''
  return `${typeSegment}/${nameSegment}`
}

function businessSlugify(input: string) {
  const raw = String(input || '')
  const [category = 'other', ...nameParts] = raw.split('/')
  const categorySegment = toKebab(category) || 'other'
  const nameSegment = toKebab(nameParts.join('/'))
  return nameSegment ? `${categorySegment}/${nameSegment}` : categorySegment
}

export const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      options: {
        list: [
          { title: 'News', value: 'News' },
          { title: 'Food', value: 'Food' },
          { title: 'Business', value: 'Business' },
          { title: 'Community', value: 'Community' },
          { title: 'Events', value: 'Events' },
          { title: 'Opinion', value: 'Opinion' },
          { title: 'Guides', value: 'Guides' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
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
      initialValue: 'outline',
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'name',
      color: 'color',
    },
    prepare({ title, color }: any) {
      return {
        title: title || 'Untitled category',
        subtitle: color ? `Color: ${color}` : 'No color set',
      }
    },
  },
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
      type: 'string',
    },
    { name: 'website', title: 'Website URL', type: 'string' },
    { name: 'x', title: 'X URL', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'string' },
    { name: 'facebook', title: 'Facebook URL', type: 'string' },
    { name: 'instagram', title: 'Instagram URL', type: 'string' },
    { name: 'tiktok', title: 'TikTok URL', type: 'string' },
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
    {
      name: 'slug',
      title: 'Slug',
      description: 'URL format: /businesses/category/name. Click Generate to recalculate from Type + Business name.',
      type: 'slug',
      options: {
        source: businessSlugSource,
        slugify: businessSlugify,
      },
      validation: (Rule: any) => Rule.required().custom((value: any) => {
        const current = value?.current || ''
        if (!current.includes('/')) return 'Slug should include category/name.'
        return true
      }),
    },
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
      title: 'Profile photo',
      type: 'image',
      description: 'Recommended: square image at least 500x500 for best results (not required).',
      options: { hotspot: true },
      validation: (Rule: any) =>
        Rule.custom(async (value: any, context: any) => {
          if (!value?.asset?._ref) return true
          const client = context.getClient({ apiVersion: '2024-01-01' })
          const asset = await client.fetch(
            '*[_id == $id][0]{metadata{dimensions{width,height}}}',
            { id: value.asset._ref }
          )
          const width = asset?.metadata?.dimensions?.width
          const height = asset?.metadata?.dimensions?.height
          if (!width || !height) return 'Could not read image dimensions. Recommended: square and at least 500x500.'
          if (width !== height) return 'Recommended: use a square image (1:1) for best display.'
          if (width < 500 || height < 500) return 'Recommended: use at least 500x500 for better quality.'
          return true
        }).warning(),
    },
    {
      name: 'website',
      title: 'Website URL',
      type: 'string',
    },
    {
      name: 'instagram',
      title: 'Instagram URL',
      type: 'string',
    },
    {
      name: 'facebook',
      title: 'Facebook URL',
      type: 'string',
    },
    {
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'string',
    },
    {
      name: 'x',
      title: 'X URL',
      type: 'string',
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
