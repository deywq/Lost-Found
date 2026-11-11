import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from './lib/api';
import { dummyItems, featureHighlights, navItems, quickStats } from './data/mockData';

const AuthContext = createContext(null);
const cardClass = 'rounded-3xl border border-slate-200 bg-white shadow-sm';
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white';
const buttonClass = 'inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api('/auth/me')
      .then((result) => { if (mounted) setUser(result.user); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
      setUser(result.user);
      return result.user;
    },
    async register(details) {
      const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(details) });
      setUser(result.user);
      return result.user;
    },
    async logout() {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState message="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">S</span>
            <span><span className="block text-xl font-bold tracking-tight">SEENIT</span><span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Lost something? Let&apos;s spot it.</span></span>
          </Link>
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold md:hidden" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <nav id="primary-navigation" className={`${menuOpen ? 'flex' : 'hidden'} order-3 w-full flex-col gap-3 border-t border-slate-100 pt-4 md:order-none md:flex md:w-auto md:flex-row md:border-0 md:pt-0`}>
            {navItems.filter((item) => item.to !== '/admin' || user?.role === 'admin').map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? <><span className="hidden max-w-32 truncate text-sm text-slate-600 sm:inline">{user.name}</span><button type="button" onClick={handleLogout} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Log out</button></> : <><Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Login</Link><Link to="/register" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Join now</Link></>}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/report-lost" element={<ProtectedRoute><ReportPage type="lost" /></ProtectedRoute>} />
          <Route path="/report-found" element={<ProtectedRoute><ReportPage type="found" /></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return <div className="space-y-10 pb-12">
    <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-6 py-10 text-white shadow-xl shadow-indigo-200 sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center"><div>
        <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Community trust network</p>
        <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">Lost something? Let&apos;s spot it.</h1>
        <p className="mt-5 max-w-xl text-base text-indigo-50/90 sm:text-lg">Help neighbors reunite valuables, documents, and keepsakes with the people who lost them.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link to="/explore" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Browse listings</Link><Link to="/report-lost" className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Report a loss</Link></div>
      </div><div className="rounded-[24px] border border-white/15 bg-white/10 p-4"><div className="rounded-[20px] bg-slate-950/20 p-4"><p className="mb-4 text-sm font-medium">Recent community reports</p><div className="space-y-3">{dummyItems.slice(0, 3).map((item) => <div key={item.id} className="rounded-2xl bg-white/10 p-3"><p className="font-semibold">{item.name}</p><p className="text-xs text-indigo-100">{item.location} · {item.status}</p></div>)}</div></div></div></div>
    </section>
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{quickStats.map((stat) => <div key={stat.label} className={`${cardClass} p-5`}><p className="mb-3 text-sm font-medium text-slate-500">{stat.label}</p><p className="text-3xl font-black tracking-tight">{stat.value}</p></div>)}</section>
    <section><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">How it helps</p><h2 className="mt-2 text-2xl font-bold">A community that looks out for each other</h2></div><Link to="/explore" className="text-sm font-semibold text-indigo-600">Explore reports</Link></div><div className="grid gap-5 lg:grid-cols-3">{featureHighlights.map((feature) => <article key={feature.title} className={`${cardClass} p-6`}><div className="mb-4 text-2xl">{feature.icon}</div><h3 className="text-xl font-bold">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p></article>)}</div></section>
  </div>;
}

function ItemCard({ item }) {
  const image = item.image || item.images?.[0]?.url;
  return <article className={`${cardClass} overflow-hidden`}>
    {image && <img src={image} alt={item.name} className="h-52 w-full object-cover" />}
    <div className="p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{item.category || 'Other'}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">{item.type}</span></div>
      <h2 className="text-xl font-bold">{item.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
      <p className="mt-4 text-sm text-slate-500">📍 {item.location || 'Location not provided'} · {item.itemDate || 'Date not provided'}</p>
      <Link to={`/items/${item.id}`} className="mt-5 inline-flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">See details</Link>
    </div>
  </article>;
}

function ExplorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api('/categories').then((result) => setCategories(result.data || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (type) params.set('type', type);
      if (categoryId) params.set('categoryId', categoryId);
      if (location.trim()) params.set('location', location.trim());
      params.set('limit', '100');
      try {
        const result = await api(`/items?${params.toString()}`, { signal: controller.signal });
        setItems(result.data || []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError(fetchError.message || 'Could not load reports.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search, type, categoryId, location]);

  return <div className="space-y-6"><section className={`${cardClass} p-6`}><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Explore</p><h1 className="mt-2 text-3xl font-black">Lost and found listings</h1><div className="mt-5 flex flex-wrap gap-2">{[['', 'All'], ['lost', 'Lost'], ['found', 'Found']].map(([value, label]) => <button key={label} type="button" onClick={() => setType(value)} aria-pressed={type === value} className={`rounded-full px-4 py-2 text-sm font-semibold ${type === value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{label}</button>)}</div></section>
    <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]"><section aria-live="polite" className="space-y-4">{loading && <LoadingState message="Loading reports…" />}{error && <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{!loading && !error && !items.length && <div className={`${cardClass} p-6 text-slate-600`}>No reports match those filters yet.</div>}{!loading && !error && items.map((item) => <ItemCard key={item.id} item={item} />)}</section>
      <aside className="space-y-5"><div className={`${cardClass} p-5`}><h2 className="text-lg font-bold">Filter reports</h2><div className="mt-4 space-y-4"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Keyword</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or description" className={inputClass} /></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Category</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or barangay" className={inputClass} /></label></div></div><div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5"><h2 className="text-xl font-bold">Have you lost something?</h2><p className="mt-2 text-sm text-slate-600">Post a report so your community can help spot it.</p><Link to="/report-lost" className={`${buttonClass} mt-5`}>Create report</Link></div></aside></div>
  </div>;
}

function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api(`/items/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((result) => setItem(result.data))
      .catch((fetchError) => { if (fetchError.name !== 'AbortError') setError(fetchError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);
  if (loading) return <LoadingState message="Loading item…" />;
  if (error || !item) return <div role="alert" className={`${cardClass} p-8 text-center`}><h1 className="text-2xl font-bold">Item unavailable</h1><p className="mt-2 text-slate-600">{error || 'This report could not be found.'}</p><Link className="mt-5 inline-flex text-indigo-600" to="/explore">Back to explore</Link></div>;
  return <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]"> <section className={`${cardClass} p-6 sm:p-8`}><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">{item.type} · {item.category}</span><h1 className="mt-5 text-3xl font-black">{item.name}</h1><p className="mt-4 leading-7 text-slate-600">{item.description}</p><dl className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs uppercase tracking-wider text-slate-500">Location</dt><dd className="mt-2 font-semibold">{item.location || 'Not provided'}</dd></div><div className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs uppercase tracking-wider text-slate-500">Date</dt><dd className="mt-2 font-semibold">{item.itemDate || 'Not provided'}</dd></div></dl><p className="mt-5 text-sm text-slate-500">Contact details are kept private in this view.</p><Link to="/login" className={`${buttonClass} mt-5`}>Sign in to contact reporter</Link></section><aside className={`${cardClass} p-5`}><h2 className="text-xl font-bold">Photos</h2><div className="mt-4 grid grid-cols-2 gap-3">{item.images?.length ? item.images.map((image) => <img key={image.id} src={image.url} alt={image.altText || item.name} className="aspect-square w-full rounded-2xl object-cover" />) : <p className="col-span-2 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No photos attached.</p>}</div></aside></div>;
}

function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!loading && user) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const payload = isRegister
        ? await register({ name: String(form.get('name') || '').trim(), email: String(form.get('email') || '').trim(), password: String(form.get('password') || '') })
        : await login({ email: String(form.get('email') || '').trim(), password: String(form.get('password') || '') });
      navigate(payload.role === 'admin' ? '/admin' : (location.state?.from || '/dashboard'), { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Could not authenticate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return <section className={`${cardClass} mx-auto max-w-md p-6 sm:p-8`}><div className="mb-6 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{isRegister ? 'Join the community' : 'Welcome back'}</p><h1 className="mt-2 text-3xl font-black">{isRegister ? 'Create your account' : 'Login to SEENIT'}</h1></div>
    <form className="space-y-5" onSubmit={submit}>{error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {isRegister && <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Full name</span><input name="name" type="text" autoComplete="name" required minLength={2} maxLength={150} className={inputClass} /></label>}
      <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Email</span><input name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} /></label>
      <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Password</span><input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 12 : 1} maxLength={72} className={inputClass} />{isRegister && <span className="mt-2 block text-xs text-slate-500">Use at least 12 characters.</span>}</label>
      <button type="submit" disabled={submitting || loading} className={`${buttonClass} w-full`}>{submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
    </form>
    <p className="mt-5 text-center text-sm text-slate-600">{isRegister ? 'Already a member?' : 'New to SEENIT?'} <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
  </section>;
}

function ReportPage({ type }) {
  return <section className={`${cardClass} mx-auto max-w-3xl p-6 sm:p-8`}><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Report {type} item</p><h1 className="mt-2 text-3xl font-black">{type === 'lost' ? 'Tell us what you lost' : 'Share what you found'}</h1><p className="mt-3 text-sm text-slate-600">Add a clear description and a location to help your community.</p><form className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Item name</span><input type="text" required className={inputClass} /></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Category</span><select className={inputClass}><option>Wallets</option><option>Electronics</option><option>Keys</option><option>Documents</option><option>Bags</option><option>Other</option></select></label></div><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Description</span><textarea rows={5} required className={inputClass} /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Date</span><input type="date" required className={inputClass} /></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Contact method</span><input type="text" required className={inputClass} /></label></div><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Location</span><input type="text" required placeholder="City or barangay" className={inputClass} /></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">Photos</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-slate-600" /></label><div className="flex justify-end"><button type="submit" className={buttonClass}>Submit report</button></div></form></section>;
}

function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    api('/items/mine', { signal: controller.signal }).then((result) => setItems(result.data || [])).catch((loadError) => { if (loadError.name !== 'AbortError') setError(loadError.message); });
    return () => controller.abort();
  }, []);
  return <div className="space-y-6"><section className={`${cardClass} p-6`}><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Member dashboard</p><h1 className="mt-2 text-3xl font-black">Welcome back, {user?.name}</h1><Link to="/report-lost" className={`${buttonClass} mt-5`}>New report</Link></section><section className={`${cardClass} p-6`}><h2 className="text-xl font-bold">My reports</h2>{error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}{!error && !items.length && <p className="mt-4 text-sm text-slate-500">You haven&apos;t posted reports yet.</p>}<div className="mt-4 space-y-3">{items.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"><div><h3 className="font-semibold">{item.name}</h3><p className="text-sm text-slate-500">{item.type} · {item.category} · {item.location || 'Location not provided'}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">{item.status}</span></article>)}</div></section></div>;
}

function AdminPage() { return <section className={`${cardClass} p-8`}><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Admin</p><h1 className="mt-2 text-3xl font-black">Admin dashboard</h1><p className="mt-3 text-slate-600">Admin API and moderation controls are not wired into this screen yet.</p></section>; }
function LoadingState({ message }) { return <div role="status" className={`${cardClass} p-6 text-sm text-slate-600`}>{message}</div>; }
function NotFoundPage() { return <section className={`${cardClass} p-8 text-center`}><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">404</p><h1 className="mt-2 text-3xl font-black">Page not found</h1><Link to="/" className="mt-5 inline-flex text-indigo-600">Back home</Link></section>; }

export default function App() {
  return <BrowserRouter><AuthProvider><Layout /></AuthProvider></BrowserRouter>;
}
