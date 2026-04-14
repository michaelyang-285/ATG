/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper:'#F4EFE4',ink:'#111111',yellow:'#F2E93E',orange:'#FF6B35','dk-orange':'#7A2800',card:'#EDEADF',mid:'#2A2A2A',
      },
      fontFamily: {
        archivo:['"Archivo Black"','sans-serif'],space:['"Space Grotesk"','sans-serif'],inter:['Inter','sans-serif'],georgia:['Georgia','serif'],
      },
      boxShadow: {
        'brutalist':'5px 5px 0px #111111','brutalist-sm':'3px 3px 0px #111111','brutalist-dk':'5px 5px 0px #7A2800','brutalist-dk-sm':'3px 3px 0px #7A2800',
      },
      maxWidth: { site:'1200px' },
      animation: { ticker:'ticker 28s linear infinite' },
      keyframes: { ticker:{'0%':{transform:'translateX(0)'},'100%':{transform:'translateX(-50%)'}}}
    },
  },
  plugins: [],
}
