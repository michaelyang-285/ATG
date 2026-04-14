// ── TAXONOMY SYSTEM ──────────────────────────────────────
// ATG uses a two-level taxonomy:
//   Primary sections (nav):  News | Eats | Events | Opinions | Businesses
//   Categories (tags):       Fine-grained labels used for filtering + SEO
//
// Stories belong to ONE primary section + ONE category.
// Categories belong to ONE primary section.
// This lets us filter "all food stories" or "just tacos."

export const section = {
  name: 'section',
  title: 'Section (Nav)',
  type: 'document',
  fields: [
    { name: 'name',  title: 'Name',  type: 'string',
      options: { list: ['News', 'Eats', 'Events', 'Opinions', 'Businesses'] } },
    { name: 'slug',  title: 'Slug',  type: 'slug', options: { source: 'name' } },
    { name: 'description', title: 'Description', type: 'string' },
  ],
}

// Fine-grained categories live under a section
export const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'name',  title: 'Category name', type: 'string' },
    { name: 'slug',  title: 'Slug', type: 'slug', options: { source: 'name' } },
    {
      name: 'section',
      title: 'Parent section',
      type: 'reference',
      to: [{ type: 'section' }],
      description: 'Which nav section does this category live under?',
    },
    {
      name: 'color',
      title: 'Tag color',
      type: 'string',
      description: 'Controls the story tag color in the feed',
      options: {
        list: [
          { title: 'Orange (Food)',       value: 'orange' },
          { title: 'Yellow (Roads)',       value: 'yellow' },
          { title: 'Ink/Black (Business)', value: 'ink' },
          { title: 'Dark gray (Dev)',      value: 'mid' },
          { title: 'Outline (Community)', value: 'outline' },
        ],
      },
    },
  ],
  // Preview in Sanity Studio shows "Food & drink (Eats)"
  preview: {
    select: { name: 'name', section: 'section.name' },
    prepare({ name, section }: any) {
      return { title: name, subtitle: section }
    },
  },
}

// ── DEFAULT CATEGORIES TO CREATE IN SANITY ────────────────
// Run this list in your Sanity import script to seed categories.
//
// News section:
//   Crime & safety, Schools, Development, Roads & traffic,
//   Local government, Health, Weather, Community
//
// Eats section:
//   Restaurant review, New opening, Food news, Bar & drinks,
//   Best-of list, Recipe
//
// Events section:
//   Free events, Family, Music, Food & drink events,
//   Sports, Community events, Festivals
//
// Opinions section:
//   Community voice, Letters, Editorial, Hot take
//
// Businesses section:
//   Just opened, Coming soon, Closed, Business news
