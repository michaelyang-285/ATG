import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from '../sanity/schemas'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'zl7y53re'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'atg',
  title: 'All Things Gwinnett',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
