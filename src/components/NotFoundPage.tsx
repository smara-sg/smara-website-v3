import { Link } from 'react-router-dom'
import Footer from './Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <p className="text-sm font-medium tracking-wide text-accent">404</p>
        <h1 className="heading-glow mt-4 text-5xl font-semibold tracking-tight text-ink md:text-6xl">Page not found</h1>
        <p className="lede mt-6">
          That address doesn&apos;t match a page on this site.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <Link to="/" className="btn-primary">Back to home</Link>
          <Link to="/gallery" className="text-sm text-accent hover:underline">Artwork</Link>
          <Link to="/events" className="text-sm text-accent hover:underline">Events</Link>
          <Link to="/about" className="text-sm text-accent hover:underline">About</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
