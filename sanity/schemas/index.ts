import { eventFormats, gameTopics } from "../../lib/game-topics";
import {DirectoryCoverageInput} from "../../studio/components/DirectoryCoverageInput";
import { defineField, defineType } from "sanity";
const image = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      { name: "alt", type: "string", title: "Alternative text" },
      { name: "caption", type: "string", title: "Caption" },
      { name: "credit", type: "string", title: "Photo credit" },
    ],
  });
const slug = defineField({
  name: "slug",
  type: "slug",
  options: { source: "title" },
  validation: (R) => R.required(),
});
const reference = (name: string, type: string, title: string) =>
  defineField({ name, title, type: "reference", to: [{ type }] });
const text = (name: string, title: string) =>
  defineField({ name, title, type: "string" });
const gameTopicField = defineField({
  name: "gameTopics", title: "Game topics", type: "array", of: [{ type: "string" }],
  options: { list: gameTopics },
  description: "Select each game explicitly featured. Stories and the calendar share these tags.",
  validation: rule => rule.unique(),
});
const categoryField = defineField({
  name: "categories", type: "array", of: [{ type: "reference", to: [{ type: "category" }] }],
});
const bodyBlocks = [
  {
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
      { title: "Quote", value: "blockquote" },
    ],
    marks: {
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            { name: "href", type: "url", title: "URL" },
            {
              name: "internal",
              type: "reference",
              to: [{ type: "post" }],
              title: "Internal story",
            },
          ],
        },
      ],
    },
  },
  {
    type: "image",
    options: { hotspot: true },
    fields: [
      { name: "alt", type: "string" },
      { name: "caption", type: "string" },
      {
        name: "besideHeading",
        type: "boolean",
        title: "Place logo beside business name",
        description: "Put this uncaptioned logo immediately after a Heading 3 business name.",
      },
    ],
  },
  ...[
    "upcomingGameEvents",
    "pullQuote",
    "callout",
    "divider",
    "editorsNote",
    "correction",
    "tldr",
  ].map((type) => ({ type })),
];
export const schemaTypes = [
  defineType({
    name: "post",
    title: "Stories & guides",
    type: "document",
    fields: [
      defineField({
        name: "title",
        title: "Headline",
        type: "string",
        validation: (R) => R.required(),
      }),
      slug,
      defineField({
        name: "excerpt",
        title: "Short summary",
        type: "text",
        rows: 3,
      }),
      defineField({
        name: "seo",
        title: "Search and social previews",
        type: "object",
        options: { collapsible: true, collapsed: true },
        fields: [
          text("title", "Search title"),
          defineField({ name: "description", title: "Meta description", type: "text", rows: 2 }),
          text("ogTitle", "Social title"),
          defineField({ name: "ogDescription", title: "Social description", type: "text", rows: 2 }),
          image("ogImage", "Social share image (1200 × 630)"),
        ],
      }),
      defineField({
        name: "section",
        title: "Homepage section",
        type: "string",
        options: {
          list: [
            { title: "Food & drink", value: "food-drink" },
            { title: "Things to do", value: "things-to-do" },
            { title: "Local life", value: "local-life" },
          ],
        },
        validation: (R) => R.required(),
      }),
      defineField({
        name: "format",
        title: "Format",
        type: "string",
        options: {
          list: [
            { title: "Story", value: "story" },
            { title: "Guide", value: "guide" },
            { title: "Review", value: "review" },
            { title: "Local news", value: "news" },
            { title: "Community voice / opinion", value: "opinion" },
            { title: "Opening or closing", value: "opening" },
          ],
        },
        initialValue: "story",
      }),
      defineField({
        name: "topic",
        title: "Optional topic",
        type: "string",
        options: {
          list: [
            { title: "Arts & culture (Things to do)", value: "arts-culture" },
            {
              title: "Schools & development (Local life)",
              value: "schools-development",
            },
          ],
        },
      }),
      defineField({
        name:"relatedDirectoryListings",
        title:"Related directory listings",
        description:"Select the businesses or organizations mentioned in this piece. Publishing adds a coverage link to each profile.",
        type:"array",
        of:[{type:"string"}],
        components:{input:DirectoryCoverageInput},
        validation:R=>R.unique()
      }),
      image("mainImage", "Main image"),
      reference("author", "author", "Author"),
      categoryField,
      gameTopicField,
      text("location", "Area / neighborhood"),
      defineField({
        name: "publishedAt",
        type: "datetime",
        validation: (R) => R.required(),
      }),
      defineField({ name: "updatedAt", type: "datetime" }),
      defineField({ name: "estimatedReadingTime", type: "number" }),
      defineField({
        name: "hideFromSearch",
        title: "Hide from public discovery",
        description:
          "Hidden posts are excluded from the public website, including direct links.",
        type: "boolean",
        initialValue: false,
      }),
      defineField({ name: "body", type: "array", of: bodyBlocks }),
    ],
    preview: {
      select: { title: "title", subtitle: "section", media: "mainImage" },
    },
  }),
  defineType({
    name: "author",
    type: "document",
    fields: [
      text("name", "Name"),
      defineField({ name: "slug", type: "slug", options: { source: "name" } }),
      text("role", "Role"),
      text("location", "Location"),
      image("image", "Photo"),
      defineField({ name: "bio", type: "text" }),
      defineField({
        name: "socials",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              { name: "platform", type: "string" },
              { name: "url", type: "url" },
            ],
          },
        ],
      }),
    ],
  }),
  defineType({
    name: "category",
    type: "document",
    fields: [
      text("title", "Category name"),
      slug,
      defineField({
        name: "color",
        type: "string",
        options: { list: ["orange", "yellow", "ink", "mid", "outline"] },
      }),
    ],
  }),
  defineType({
    name: "business",
    type: "document",
    fields: [
      text("name", "Business name"),
      defineField({
        name: "slug",
        type: "slug",
        options: { source: "name" },
        validation: (R) => R.required(),
      }),
      defineField({
        name: "category",
        type: "string",
        options: { list: ["Food", "Beauty", "Local services"] },
      }),
      text("neighborhood", "Area"),
      text("address", "Address"),
      defineField({ name: "url", title: "Website", type: "url" }),
      defineField({ name: "summary", type: "text" }),
      image("image", "Business photo"),
    ],
  }),
  defineType({
    name: "event",
    type: "document",
    fields: [
      text("title", "Event name"),
      categoryField,
      gameTopicField,
      defineField({ name: "eventFormats", title: "Event formats", type: "array",
        of: [{ type: "string" }], options: { list: eventFormats }, validation: rule => rule.unique() }),
      defineField({ name: "outsideGwinnett", title: "Venue is outside Gwinnett County", type: "boolean",
        description: "Nearby events stay on the main calendar. County-specific lists show local venues." }),
      defineField({ name: "cancelled", title: "Event cancelled", type: "boolean" }),
      slug,
      defineField({
        name: "startsAt",
        type: "datetime",
        validation: (R) => R.required(),
      }),
      defineField({ name: "endsAt", type: "datetime" }),
      text("venue", "Venue"),
      text("neighborhood", "Area"),
      text("street", "Street address"),
      text("city", "City"),
      text("postalCode", "ZIP code"),
      defineField({name: "ticketUrl", type: "url", title: "Direct ticket or registration page", description: "Use a link where attendees can actually book this event."}),
      text("organizer", "Public organizer name"),
      defineField({name:"additionalSessions",title:"Additional selected dates",type:"array",of:[{name:"eventSession",type:"object",fields:[
        {name:"startsAt",title:"Starts",type:"datetime",validation:rule=>rule.required()},
        {name:"endsAt",title:"Ends",type:"datetime"}
      ]}]}),
      defineField({name:"pricingDetails",title:"Pricing details",type:"text"}),
      defineField({name:"registrationRequired",title:"Registration required",type:"boolean"}),
      defineField({name:"weeklyUntil",title:"Repeat weekly through",type:"date"}),
      defineField({name:"cost",title:"Admission",type:"string",options:{list:["free","paid"]}}),
      defineField({name:"price",title:"Ticket price (USD)",type:"number"}),
      text("priceLabel", "Price"),
      defineField({
        name: "url",
        title: "Organizer / registration link",
        type: "url",
      }),
      defineField({ name: "summary", type: "text" }),
      image("image", "Event image"),
    ],
  }),
  defineType({
    name: "siteSettings",
    title: "Homepage & site settings",
    type: "document",
    fields: [
      text("groupName", "Publication name"),
      defineField({ name: "groupUrl", type: "url" }),
      reference("featuredPost", "post", "Featured guide or story"),
      defineField({
        name: "sidebarPosts",
        title: "Around Gwinnett stories",
        type: "array",
        of: [{ type: "reference", to: [{ type: "post" }] }],
        validation: (R) => R.max(3),
      }),
      defineField({
        name: "featuredGuides",
        title: "More useful guides",
        type: "array",
        of: [{ type: "reference", to: [{ type: "post" }] }],
        validation: (R) => R.max(2),
      }),
      defineField({
        name: "newsletterUrl",
        title: "Hosted newsletter signup URL",
        description:
          "Leave blank until your email provider is ready. The website will show an honest opening-soon state.",
        type: "url",
      }),
      defineField({ name: "groupMembers", type: "number", hidden: true }),
      defineField({
        name: "newsletterSubscribers",
        type: "number",
        hidden: true,
      }),
    ],
    preview: { prepare: () => ({ title: "Homepage & site settings" }) },
  }),
  defineType({
    name: "upcomingGameEvents", title: "Upcoming game events", type: "object",
    fields: [text("heading", "Heading")],
    preview: { prepare: () => ({ title: "Next five calendar events for this story’s game topic" }) },
  }),
  defineType({
    name: "pullQuote",
    type: "object",
    fields: [
      { name: "text", type: "text" },
      text("attribution", "Attribution"),
    ],
  }),
  defineType({
    name: "callout",
    type: "object",
    fields: [
      text("heading", "Heading"),
      { name: "style", type: "string", title: "Style", description: "Use table for a comparison, profile for a vendor, or action for a call to action. For a table, enter one paragraph per row. Use Shift+Enter between cells, with column headings in the first row." },
      { name: "body", type: "array", of: [{ type: "block" }] },
    ],
  }),
  defineType({
    name: "divider",
    type: "object",
    fields: [text("style", "Style")],
  }),
  defineType({
    name: "gallery",
    type: "object",
    fields: [
      {
        name: "images",
        type: "array",
        of: [{ type: "image", options: { hotspot: true } }],
      },
    ],
  }),
  ...["videoEmbed", "socialEmbed", "mapEmbed"].map((name) =>
    defineType({
      name,
      type: "object",
      fields: [
        { name: "url", type: "url" },
        text("caption", "Caption"),
        text("address", "Address"),
        text("content", "Text"),
      ],
    }),
  ),
  ...[
    ["relatedStoryRef", "post"],
    ["businessRef", "business"],
    ["eventRef", "event"],
  ].map(([name, type]) =>
    defineType({
      name,
      type: "object",
      fields: [reference("reference", type, "Related item")],
    }),
  ),
  ...["editorsNote", "correction"].map((name) =>
    defineType({
      name,
      type: "object",
      fields: [
        text("title", "Title"),
        { name: "body", type: "text" },
        { name: "correctedAt", type: "datetime" },
      ],
    }),
  ),
  defineType({
    name: "tldr",
    type: "object",
    fields: [
      text("heading", "Heading"),
      { name: "points", type: "array", of: [{ type: "string" }] },
    ],
  }),
  defineType({
    name: "faq",
    type: "object",
    fields: [
      text("heading", "Heading"),
      {
        name: "items",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              { name: "question", type: "string" },
              { name: "answer", type: "array", of: [{ type: "block" }] },
            ],
          },
        ],
      },
    ],
  }),
];
