import { Link } from 'react-router-dom'
import Footer from './Footer'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-sm font-medium text-blue-600 tracking-wide">404</p>
        <h1 className="text-4xl md:text-5xl font-light text-gray-800 mt-4">Page not found</h1>
        <p className="text-lg text-gray-600 mt-6 leading-relaxed">
          That address doesn&apos;t match a page on this site.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="gradient-emerald text-white px-6 py-3 rounded-full font-medium"
          >
            Back to home
          </Link>
          <Link
            to="/gallery"
            className="px-6 py-3 rounded-full font-medium text-gray-700 bg-white border border-gray-200 hover:text-blue-600"
          >
            Artwork
          </Link>
          <Link
            to="/events"
            className="px-6 py-3 rounded-full font-medium text-gray-700 bg-white border border-gray-200 hover:text-blue-600"
          >
            Events
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 rounded-full font-medium text-gray-700 bg-white border border-gray-200 hover:text-blue-600"
          >
            About
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
