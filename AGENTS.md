# Editorial publishing

Publish every All Things Gwinnett article as a Sanity post. Store the full editable article body, headline, byline and editorial metadata in Sanity. Render the published post through the shared story route and site navigation. Interactive graphics may use frontend components and data assets. Verify the full published body and the public story before reporting publication.

Place article citations under a Sources heading in Sanity. Use the shared 0.875rem source-link style for all articles, including custom article layouts.

For holiday service guides, publish the first useful edition several days ahead of the holiday. Add confirmed hours to the same article as they come in, and set the post’s updatedAt when an edit adds substantive reporting.

## Directory and article search and sharing checks

For every new or revised public listing, article, or guide, prepare five items before publication: the HTML title, meta description, Open Graph title, Open Graph description, and a 1200 × 630 share image. Write search copy for the specific subject and verified area. Give the social headline a concrete hook and its description a complementary detail. Read each in context for accuracy, duplicate language and broken words. Review the card at feed size.

For a Sanity article or guide, save the four copy fields and the image in the post’s `seo` object. Check the actual draft with `python3 scripts/check-publishing-metadata.py --story-draft post.json` before publishing through Studio or the API. The checker requires Python 3 and Pillow. For a staff-created directory listing, run `npx tsx@4 scripts/preview-directory-draft.ts listing.json preview.png` on the public listing fields. Read the four returned strings and inspect the actual PNG with the primary-category artwork. The same template works without a business logo. The moderator approval queue previews the copy and checks the rendered image before accepting a revision. Use a listing-specific editorial override if the generated wording is too generic.

After publication, run `python3 scripts/check-publishing-metadata.py LIVE_URL` against the canonical URL. Compare the four returned strings with the reviewed copy, inspect the share card, and rerun after correcting any failure. Without URLs, the checker audits the sitemap and reports duplicates across pages. Use it for the recurring production audit. A missing Facebook app ID alone does not affect a passing preview.
