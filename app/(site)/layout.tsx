import Nav from '@/components/Nav'
import { Footer } from '@/components/Misc'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  )
}
