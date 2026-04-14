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
    { name: 'author',      title: 'Author',        type: 'string', initialValue: 'ATG Staff' },
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
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
  preview: {
    select: { title: 'title', category: 'category.name', media: 'thumbnail' },
    prepare({ title, category, media }) {
      return { title, subtitle: category, media }
    },
  },
}
