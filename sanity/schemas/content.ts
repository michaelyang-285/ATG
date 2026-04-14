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
    { name: 'name',         title: 'Business name', type: 'string' },
    { name: 'businessType', title: 'Type',           type: 'string', description: 'e.g. Vietnamese · Norcross' },
    { name: 'location',     title: 'Location',       type: 'string' },
    { name: 'description',  title: 'Description',    type: 'text', rows: 2 },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Just opened',  value: 'opened' },
          { title: 'Coming soon',  value: 'soon' },
        ],
      },
    },
    { name: 'openedAt', title: 'Opened / Opening date', type: 'date' },
    { name: 'slug',     title: 'Slug', type: 'slug', options: { source: 'name' } },
  ],
}
