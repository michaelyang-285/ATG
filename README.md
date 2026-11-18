# All Things Gwinnett

The approved “Guide desk” homepage and navigation, built with Next.js 14.2.35, React 18, TypeScript and Sanity. Brand specifications are in DESIGN.md; product decisions are in PRODUCT.md.

## Existing services

- Repository: https://github.com/michaelyang-285/ATG
- Production: https://allthingsgwinnett.com — Vercel project `atg-site`, team `285-marketing`.
- Sanity: project `xnm5c645`, public `production` dataset.
- Studio: https://www.sanity.io/@oUcV9EK10/studio/tg2pib63zu890y3tcluji8jy

## Local development

Use Node.js 24. Run `npm ci`, copy `.env.local.example` to `.env.local`, then run `npm run dev`. Run `npm run build` for type checking and production compilation.

The website reads public published content; no Sanity write token is needed. Never commit authentication credentials or local environment backups.

For Studio, run `npm ci` and `npm run dev` in `studio/`. The source schema is `sanity/schemas/index.ts`. Studio deploys to the existing application ID in `studio/sanity.cli.ts`; do not create another project.

## Publishing

Create an author, then a story with a headline, slug, section, format, publication date and body. Use the optional topic for Arts & culture or Schools & development. Add genuine photography with alternative text and credit. Publish when ready. Hidden posts, drafts and future-dated posts do not appear publicly. The old test article is preserved but hidden.

In **Homepage & site settings**, select a featured story, up to three supporting stories and up to two guides. With no selection, the homepage uses recent published content. Updates appear within about a minute. Topic and area navigation appears as content becomes available.

Businesses and events are manually created and published in Studio. Only upcoming events appear. The website includes topic hubs, guides, search, area browsing, business pages and article pages; legacy URLs redirect to their replacements.

## Launch state

No finished reporting or directory listings were provided. Empty sections explicitly say they are coming soon. Newsletter signup opens when a real hosted signup URL is supplied in site settings. Public submission APIs return 503 until their workflows are configured. The proposed $5 listing charge has no active checkout or invented billing schedule.

## Deployment

Build and test before releasing. For a staged production build in the existing Vercel project, run `vercel deploy --prod --skip-domain --scope 285-marketing`, verify it, then promote the tested deployment. The production project ID is `prj_48R16IDTQ5798CZrJoi1pfDtFwFc`. Keep public Sanity variables set to the IDs above.

To update the existing Studio, run `sanity deploy --yes --schema-required` from `studio/` with an authorized Sanity login. The application ID in the CLI configuration pins the target.

### Owner directory

Use /directory/manage for owner sign-in, listing edits and moderator review. Apply
supabase/migrations/20261118_directory.sql to the directory Supabase project.
Set the directory variables in .env.local.example before building. Enable email
magic links, configure the signup email sender, and allow the exact
DIRECTORY_SITE_URL/directory/manage redirect in Supabase Auth. Assign trusted
reviewers the directory_admin boolean in their server-managed Auth app_metadata.
Register /api/directory/webhook for checkout.session.completed in the same
Stripe account and mode as STRIPE_SECRET_KEY. Store its signing secret in
STRIPE_DIRECTORY_WEBHOOK_SECRET. Verify BotID on a Vercel preview.

Sanity continues to publish staff-created business listings. Owner listings use a
private revision and a separate approved snapshot in Postgres. Moderators sign
in at the same dashboard to approve, return, or decline a revision. Checkout is
a one-time USD 3 charge per owner listing. Use Stripe test mode for acceptance.
