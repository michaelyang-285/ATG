/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/stories/gwinnett-schools-since-2004", destination: "/stories/were-gwinnett-county-public-schools-better-in-the-2000s", permanent: true }];
  },
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        pathname: '/storage/v1/object/public/directory-media/**',
      }] : []),
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

module.exports = require("botid/next/config").withBotId(nextConfig)
