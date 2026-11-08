import { BrowserRouter, NavLink, Route, Routes, Link, useParams } from 'react-router-dom';
import {
  adminStats,
  dashboardCards,
  dummyItems,
  featureHighlights,
  navItems,
  quickStats,
} from './data/mockData';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm shadow-indigo-200">
              S
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900">SEENIT</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Lost something? Let&apos;s spot it.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500"
            >
              Join now
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/report-lost" element={<ReportLostPage />} />
          <Route path="/report-found" element={<ReportFoundPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div className="space-y-10 pb-12">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-6 py-10 text-white shadow-xl shadow-indigo-200 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-50">
              Community trust network
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Lost something? Let&apos;s spot it.
            </h1>
            <p className="mt-5 max-w-xl text-base text-indigo-50/90 sm:text-lg">
              Help neighbors reunite valuables, documents, and keepsakes with the people who lost them.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/explore"
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Browse listings
              </Link>
              <Link
                to="/report-lost"
                className="inline-flex rounded-full border border-white/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Report a loss
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm shadow-lg">
            <div className="rounded-[20px] bg-slate-950/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-50">Live community activity</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-medium text-emerald-100">
                  Online now
                </span>
              </div>

              <div className="space-y-3">
                {dummyItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white/10 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-indigo-100">{item.location}</p>
                      </div>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-50">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-sm font-medium text-slate-500">{stat.label}</div>
            <div className="text-3xl font-black tracking-tight text-slate-900">{stat.value}</div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Featured</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Recent community reports</h2>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {dummyItems.slice(0, 3).map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <img src={item.image} alt={item.name} className="h-52 w-full object-cover" />
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                    {item.category}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{item.date}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Reported by</p>
                    <p className="font-semibold text-slate-700">{item.reporter}</p>
                  </div>
                  <Link
                    to={`/items/${item.id}`}
                    className="inline-flex rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {featureHighlights.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-700">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function ExplorePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Explore</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Lost and found listings</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Lost', 'Found', 'Recent', 'Nearby'].map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full px-3 py-2 text-sm font-medium ${
                  item === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="space-y-5">
          {dummyItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover md:min-h-[220px]" />
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                      {item.status}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">{item.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>📍 {item.location}</span>
                    <span>📅 {item.date}</span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contact</p>
                      <p className="font-semibold text-slate-700">{item.contact}</p>
                    </div>
                    <Link
                      to={`/items/${item.id}`}
                      className="inline-flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                      See details
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Filter results</h3>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Keyword</span>
                <input
                  type="text"
                  placeholder="Search item name or description"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
                <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white">
                  <option>All categories</option>
                  <option>Electronics</option>
                  <option>Wallets</option>
                  <option>Keys</option>
                  <option>Documents</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Location</span>
                <input
                  type="text"
                  placeholder="City or barangay"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:bg-white"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-indigo-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Need a match?</p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">Report an item you lost</h3>
            <p className="mt-2 text-sm text-slate-600">Submit details to help the community spot your belonging faster.</p>
            <Link
              to="/report-lost"
              className="mt-5 inline-flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500"
            >
              Create report
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReportLostPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Report lost item</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Tell us what you lost</h1>
      </div>

      <form className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Item name</span>
            <input type="text" defaultValue="Black wallet" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
            <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white">
              <option>Wallets</option>
              <option>Electronics</option>
              <option>Keys</option>
              <option>Documents</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
          <textarea rows={5} defaultValue="Lost a black leather wallet near the university library around 6:30 PM. It contains an ID card and some cash." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Date last seen</span>
            <input type="date" defaultValue="2026-11-10" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Contact method</span>
            <input type="text" defaultValue="+63 917 123 4567" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-600">Upload photos</p>
          <input type="file" multiple className="mt-3 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Save draft
          </button>
          <button type="submit" className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
            Submit report
          </button>
        </div>
      </form>
    </div>
  );
}

function ReportFoundPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Report found item</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Share what you found</h1>
      </div>

      <form className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Item name</span>
            <input type="text" defaultValue="Silver keychain" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
            <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white">
              <option>Keys</option>
              <option>Electronics</option>
              <option>Accessories</option>
              <option>Documents</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
          <textarea rows={5} defaultValue="I found a silver keychain with a small tag attached near the campus gate this morning." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Found date</span>
            <input type="date" defaultValue="2026-11-11" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Preferred contact</span>
            <input type="text" defaultValue="sean@seenit.local" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-600">Upload photos</p>
          <input type="file" multiple className="mt-3 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
            Submit found item
          </button>
        </div>
      </form>
    </div>
  );
}

function ItemDetailPage() {
  const { id } = useParams();
  const item = dummyItems.find((currentItem) => currentItem.id === Number(id));

  if (!item) {
    return <NotFoundPage />;
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <img src={item.image} alt={item.name} className="h-72 w-full object-cover sm:h-80 lg:h-[420px]" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
              {item.category}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              {item.status}
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">{item.name}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{item.description}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Location</p>
              <p className="mt-2 font-semibold text-slate-800">{item.location}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date reported</p>
              <p className="mt-2 font-semibold text-slate-800">{item.date}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Reporter</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">{item.reporter}</p>
                <p className="text-sm text-slate-500">{item.contact}</p>
              </div>
              <button type="button" className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                Contact reporter
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Map preview</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="h-56 bg-[radial-gradient(circle_at_center,_#dbeafe_0%,_#bfdbfe_28%,_#93c5fd_48%,_#e2e8f0_49%,_#f8fafc_100%)] p-4">
                <div className="relative h-full w-full rounded-xl border border-slate-200 bg-white/60">
                  <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-indigo-600 bg-indigo-100" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Possible matches</h3>
            <div className="mt-4 space-y-3">
              {dummyItems.slice(0, 2).map((match) => (
                <Link key={match.id} to={`/items/${match.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-50">
                  <img src={match.image} alt={match.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-slate-800">{match.name}</p>
                    <p className="text-sm text-slate-500">{match.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Login to SEENIT</h1>
      </div>

      <form className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
          <input type="email" defaultValue="member@seenit.app" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
          <input type="password" defaultValue="password123" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
        </label>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            Remember me
          </label>
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Need an account?
          </Link>
        </div>

        <button type="submit" className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
          Sign in
        </button>
      </form>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Join the community</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Create your account</h1>
      </div>

      <form className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">First name</span>
            <input type="text" defaultValue="Ariel" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Last name</span>
            <input type="text" defaultValue="Castro" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
          <input type="email" defaultValue="ariel@seenit.app" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
          <input type="password" defaultValue="password123" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
        </label>

        <button type="submit" className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
          Create account
        </button>
      </form>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Member dashboard</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Welcome back, Ariel</h1>
          </div>
          <Link to="/report-lost" className="inline-flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            New report
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">My reports</h2>
          <div className="mt-5 space-y-4">
            {dummyItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.location}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
          <div className="mt-5 space-y-4">
            {['Liza: Is this your blue backpack?', 'Marco: I found a similar wallet.'].map((message) => (
              <div key={message} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {message}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Operations overview</h1>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Moderation queue</h2>
          <div className="mt-5 space-y-4">
            {dummyItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.location}</p>
                </div>
                <button type="button" className="rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">User management</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
              <span>Ariel Castro</span>
              <span className="font-semibold text-indigo-600">Active</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
              <span>Liza Santos</span>
              <span className="font-semibold text-indigo-600">Verified</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
              <span>Marco Reyes</span>
              <span className="font-semibold text-amber-600">Pending review</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">This page does not exist yet in the SEENIT prototype.</p>
      <Link to="/" className="mt-5 inline-flex rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
        Back to home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}







































































































































































































                 
