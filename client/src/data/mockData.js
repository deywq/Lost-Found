export const navItems = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore Items' },
  { to: '/report-lost', label: 'Report Lost Item' },
  { to: '/report-found', label: 'Report Found Item' },
  { to: '/dashboard', label: 'User Dashboard' },
  { to: '/admin', label: 'Admin Dashboard' },
];

export const quickStats = [
  { label: 'Lost reports', value: '2,483' },
  { label: 'Found items', value: '3,910' },
  { label: 'Match success', value: '88%' },
  { label: 'Community members', value: '24.7k' },
];

export const featureHighlights = [
  {
    icon: '📍',
    title: 'Location-aware matches',
    text: 'Search by barangay, school, mall, or city to find nearby items that may belong to your community.',
  },
  {
    icon: '🧾',
    title: 'Quick report flow',
    text: 'Upload a photo, add a description, and create a clear digital record in a few steps.',
  },
  {
    icon: '💬',
    title: 'Safer contact',
    text: 'Keep contact details private until both parties confirm interest in a possible match.',
  },
];

export const dummyItems = [
  {
    id: 1,
    name: 'Black Leather Wallet',
    category: 'Wallets',
    status: 'Lost',
    location: 'University Ave, Davao City',
    date: 'Nov 11, 2026',
    description: 'Lost near the campus library. It has a black leather finish, a small coin pocket, and a student ID tucked inside.',
    reporter: 'Ariel C.',
    contact: '+63 917 123 4567',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Blue Backpack',
    category: 'Bags',
    status: 'Found',
    location: 'SM City Annex',
    date: 'Nov 10, 2026',
    description: 'Found by the food court. Blue backpack with a small pink patch and a few textbooks. Please claim with a description.',
    reporter: 'Liza S.',
    contact: '+63 919 444 8921',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Silver Keychain',
    category: 'Keys',
    status: 'Found',
    location: 'Bahay ng Alumni',
    date: 'Nov 9, 2026',
    description: 'A silver keychain with a small engraved heart and keys attached. Last seen near the gate.',
    reporter: 'Marco R.',
    contact: '+63 920 314 1188',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Red AirPods Case',
    category: 'Electronics',
    status: 'Lost',
    location: 'Barangay 25',
    date: 'Nov 8, 2026',
    description: 'Red charging case with a small dent on the side. Last seen after commuting home from the station.',
    reporter: 'Shane D.',
    contact: '+63 917 906 7720',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
];

export const dashboardCards = [
  { label: 'Lost items', value: '12' },
  { label: 'Found items', value: '9' },
  { label: 'Pending matches', value: '5' },
  { label: 'Unread messages', value: '3' },
];

export const adminStats = [
  { label: 'Total users', value: '4,280' },
  { label: 'Lost reports', value: '1,420' },
  { label: 'Found reports', value: '1,980' },
  { label: 'Pending reviews', value: '38' },
];
