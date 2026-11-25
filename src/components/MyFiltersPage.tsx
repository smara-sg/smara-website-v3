import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/context';
import OptimizedImage from './OptimizedImage';
import Footer from './Footer';

import { memberSamples } from '../auth/filterCatalog';


export function MemberAccess({ children, filter }: { children: ReactNode; filter?: string }) {
  const auth = useAuth();
  const { pathname, search } = useLocation();
  const userId = auth.user?.id;
  const [filtersUser, setFiltersUser] = useState<string>();
  const [filters, setFilters] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!userId) { setFilters(null); return; }
    const controller = new AbortController();
    setError(''); setFilters(null);
    void fetch('/.netlify/functions/member-filters', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => { if (!controller.signal.aborted) { setFilters(data.filters); setFiltersUser(userId); } })
      .catch(() => { if (!controller.signal.aborted) setError('Your filters couldn’t be loaded. Please refresh and try again.'); });
    return () => controller.abort();
  }, [userId]);
  if (auth.loading) return <p role="status" className="p-8 text-center">Checking your account…</p>;
  if (!auth.user) return <div className="mx-auto max-w-md p-8 text-center"><h1 className="text-3xl font-semibold">Your filters, wherever you are.</h1><p className="mt-4 text-mute">Create your free account to unlock the exclusive Moonlit Mandala AR filter, or sign in to open your collection.</p><Link to={`/account/?next=${encodeURIComponent(pathname + search)}`} className="btn-primary mt-6">Sign in / Create free account</Link></div>;
  if (error) return <p role="alert" className="p-8 text-center">{error}</p>;
  if (!filters || filtersUser !== userId) return <p role="status" className="p-8 text-center">Loading your filters…</p>;
  if (filter && !filters.includes(filter)) return <div className="mx-auto max-w-md p-8 text-center"><h1 className="text-3xl font-semibold">This filter isn’t in your collection yet.</h1><p className="mt-4 text-mute">A shared link doesn’t include access. Sign in with the account you used to purchase it.</p><Link to="/my-filters/" className="btn-primary mt-6">My filters</Link></div>;
  return <>{filter ? children : <>
    {filters.length === 0 && <div className="rounded-3xl bg-mist p-8 text-center"><p className="text-mute">Your exclusive free Moonlit Mandala filter will appear here once your account is confirmed. If you have just confirmed it, refresh this page.</p><Link to="/buy-your-own/" className="btn-primary mt-6">Explore filters <ArrowRight size={18} /></Link></div>}
    <ul className="grid gap-7 sm:grid-cols-2">
      {memberSamples.filter(sample => filters.includes(sample.slug)).map(sample => <li key={sample.slug}>
        <Link to={`/my-filters/camera/?filter=${encodeURIComponent(sample.slug)}`} className="group block overflow-hidden rounded-3xl bg-mist">
          <div className="relative aspect-[9/16] overflow-hidden"><OptimizedImage src={sample.image} alt={sample.name} width={1080} height={1920} fill sizes="(min-width: 768px) 320px, calc(100vw - 48px)" /><span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"><Camera size={42} strokeWidth={1.5} /><span className="text-lg font-medium">Open experience</span></span></div>
          <h2 className="p-5 text-lg font-semibold text-ink">{sample.name}{sample.slug === 'moonlit-mandala' && <span className="mt-2 block text-sm font-normal text-accent">Free account exclusive</span>}</h2>
        </Link>
      </li>)}
    </ul>
  </>}</>;
}

export default function MyFiltersPage() {
  return <div className="min-h-screen bg-white"><main className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24"><h1 className="mb-4 text-center text-4xl font-semibold tracking-tight text-ink">My filters</h1><p className="mb-10 text-center text-mute">Your collection. Your moment of calm.</p><MemberAccess><></></MemberAccess></main><Footer /></div>;
}
