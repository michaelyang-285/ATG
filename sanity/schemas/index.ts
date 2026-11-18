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
    ],
  },
  ...[
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
      defineField({
        name: "categories",
        type: "array",
        of: [{ type: "reference", to: [{ type: "category" }] }],
      }),
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
      text("organizer", "Public organizer name"),
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
      text("style", "Style"),
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
