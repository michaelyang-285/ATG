import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'zl7y53re'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
})
