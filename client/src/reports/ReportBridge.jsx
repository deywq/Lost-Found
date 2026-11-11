import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const categoryIds = new Map([
  ['Accessories', '1'], ['Bags', '2'], ['Documents', '3'], ['Electronics', '4'],
  ['Keys', '5'], ['Other', '6'], ['Wallets', '7'],
]);
const nominatimUrl = 'https://nominatim.openstreetmap.org';

function setStatus(form, message, error = false) {
  let status = form.querySelector('[data-report-status]');
  if (!status) {
    status = document.createElement('p');
    status.dataset.reportStatus = 'true';
    status.setAttribute('role', 'status');
    form.prepend(status);
  }
  status.className = `mb-4 rounded-xl px-4 py-3 text-sm ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`;
  status.textContent = message;
}

function setLocationStatus(element, message, isError = false) {
  element.textContent = message;
  element.className = `mt-2 text-sm ${isError ? 'text-rose-700' : 'text-slate-600'}`;
}

function createLocationSelector(form, photoInput) {
  let label = form.querySelector('[data-location-selector]');
  if (!label) {
    label = document.createElement('div');
    label.dataset.locationSelector = 'true';
    label.className = 'space-y-3 rounded-2xl border border-slate-200 bg-white p-4';
    label.innerHTML = `
      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-600">Search location</span>
        <div class="flex flex-col gap-2 sm:flex-row">
          <input data-location-search type="search" maxlength="200" placeholder="Street, school, mall, barangay, or city" class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white" />
          <button data-location-search-button type="button" class="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">Search Location</button>
        </div>
      </label>
      <div data-location-suggestions class="hidden space-y-2" role="listbox" aria-label="Location search suggestions"></div>
      <div data-location-map class="h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-100" aria-label="Select a location on the map"></div>
      <div class="flex flex-wrap items-center gap-2">
        <button data-location-current type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Use My Current Location</button>
        <span data-location-coordinates class="text-xs text-slate-500">Search for a place or select a point on the map.</span>
      </div>
      <p data-location-message class="text-sm text-slate-600" role="status">A location is required. You can enter an address manually or select it on the map.</p>
      <input data-location-address type="hidden" />
      <input data-location-latitude type="hidden" />
      <input data-location-longitude type="hidden" />
    `;
    const filePanel = photoInput?.closest('.rounded-2xl');
    if (filePanel) form.insertBefore(label, filePanel);
    else form.append(label);
  }

  const searchInput = label.querySelector('[data-location-search]');
  const searchButton = label.querySelector('[data-location-search-button]');
  const suggestions = label.querySelector('[data-location-suggestions]');
  const mapElement = label.querySelector('[data-location-map]');
  const currentButton = label.querySelector('[data-location-current]');
  const coordinates = label.querySelector('[data-location-coordinates]');
  const message = label.querySelector('[data-location-message]');
  const addressField = label.querySelector('[data-location-address]');
  const latitudeField = label.querySelector('[data-location-latitude]');
  const longitudeField = label.querySelector('[data-location-longitude]');

  const map = L.map(mapElement).setView([12.8797, 121.774], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  let marker = null;
  let selectedAddress = '';
  let lastRequestAt = 0;
  let disposed = false;

  function setSelectedLocation(address, lat, lon, zoom = 16) {
    if (disposed) return;
    selectedAddress = address;
    searchInput.value = address;
    addressField.value = address;
    latitudeField.value = String(lat);
    longitudeField.value = String(lon);
    coordinates.textContent = `Selected coordinates: ${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`;
    setLocationStatus(message, `Selected: ${address}`);
    if (!marker) {
      marker = L.marker([lat, lon], { draggable: true }).addTo(map);
      marker.on('dragend', async () => {
        const point = marker.getLatLng();
        await updateFromCoordinates(point.lat, point.lng);
      });
    } else {
      marker.setLatLng([lat, lon]);
    }
    map.setView([lat, lon], zoom);
  }

  async function nominatimRequest(endpoint, params) {
    const delay = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
    lastRequestAt = Date.now();
    const query = new URLSearchParams({ ...params, format: 'jsonv2', addressdetails: '1' });
    const response = await fetch(`${nominatimUrl}/${endpoint}?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Location service is temporarily unavailable. Try again shortly.');
    return response.json();
  }

  async function updateFromCoordinates(lat, lon) {
    setLocationStatus(message, 'Looking up the selected address…');
    try {
      const results = await nominatimRequest('reverse', { lat: String(lat), lon: String(lon) });
      const address = results.display_name || `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`;
      setSelectedLocation(address, lat, lon);
    } catch (error) {
      setSelectedLocation(`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`, lat, lon);
      setLocationStatus(message, error.message || 'Could not look up the address. Coordinates were saved.', true);
    }
  }

  map.on('click', async (event) => updateFromCoordinates(event.latlng.lat, event.latlng.lng));

  async function searchPlaces() {
    const query = searchInput.value.trim();
    if (query.length < 3) {
      setLocationStatus(message, 'Enter at least 3 characters to search.', true);
      return;
    }
    searchButton.disabled = true;
    setLocationStatus(message, 'Searching OpenStreetMap…');
    try {
      const results = await nominatimRequest('search', { q: query, limit: '5' });
      suggestions.replaceChildren();
      if (!results.length) {
        suggestions.classList.add('hidden');
        setLocationStatus(message, 'No matching places found. Try a nearby street, barangay, or city.', true);
        return;
      }
      results.forEach((result) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.setAttribute('role', 'option');
        option.className = 'block w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50';
        option.textContent = result.display_name;
        option.addEventListener('click', () => {
          setSelectedLocation(result.display_name, Number(result.lat), Number(result.lon));
          suggestions.classList.add('hidden');
          suggestions.replaceChildren();
        });
        suggestions.append(option);
      });
      suggestions.classList.remove('hidden');
      setLocationStatus(message, 'Choose a suggestion or click the map to set the exact point.');
    } catch (error) {
      setLocationStatus(message, error.message || 'Location search failed. Try again.', true);
    } finally {
      searchButton.disabled = false;
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(message, 'Location access is not available in this browser. Search or choose a point on the map.', true);
      return;
    }
    currentButton.disabled = true;
    setLocationStatus(message, 'Requesting permission to use your current location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        currentButton.disabled = false;
        updateFromCoordinates(coords.latitude, coords.longitude);
      },
      (error) => {
        currentButton.disabled = false;
        const explanation = error.code === error.PERMISSION_DENIED
          ? 'Permission was denied. Search for a place or select it manually on the map.'
          : 'Could not determine your location. Search for a place or select it on the map.';
        setLocationStatus(message, explanation, true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const onSearchClick = () => searchPlaces();
  const onSearchKeyDown = (event) => {
    if (event.key === 'Enter') { event.preventDefault(); searchPlaces(); }
  };
  const onSearchInput = () => {
    if (searchInput.value.trim() !== selectedAddress) {
      addressField.value = '';
      latitudeField.value = '';
      longitudeField.value = '';
      coordinates.textContent = 'Choose a search result or map point to attach coordinates.';
      setLocationStatus(message, 'Select a search suggestion or map point to save a verified location.');
    }
  };
  searchButton.addEventListener('click', onSearchClick);
  searchInput.addEventListener('keydown', onSearchKeyDown);
  searchInput.addEventListener('input', onSearchInput);
  currentButton.addEventListener('click', useCurrentLocation);
  window.setTimeout(() => { if (!disposed) map.invalidateSize(); }, 0);

  return {
    getValue() {
      const address = addressField.value.trim() || searchInput.value.trim();
      if (!address) return null;
      const latitude = latitudeField.value ? Number(latitudeField.value) : null;
      const longitude = longitudeField.value ? Number(longitudeField.value) : null;
      return { address, ...(latitude !== null && longitude !== null ? { latitude, longitude } : {}) };
    },
    dispose() {
      disposed = true;
      searchButton.removeEventListener('click', onSearchClick);
      searchInput.removeEventListener('keydown', onSearchKeyDown);
      searchInput.removeEventListener('input', onSearchInput);
      currentButton.removeEventListener('click', useCurrentLocation);
      map.remove();
    },
  };
}

async function submitReport(form, locationSelector, isLost) {
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  const inputs = form.querySelectorAll('input');
  const nameInput = [...inputs].find((input) => input.type === 'text' && !input.dataset.locationSearch && !input.dataset.reportLocation);
  const textInputs = [...inputs].filter((input) => input.type === 'text' && !input.dataset.locationSearch && !input.dataset.reportLocation);
  const contactInput = textInputs.at(-1);
  const categorySelect = form.querySelector('select');
  const descriptionInput = form.querySelector('textarea');
  const dateInput = form.querySelector('input[type="date"]');
  const photoInput = form.querySelector('input[type="file"]');
  const location = locationSelector.getValue();

  if (!location) {
    setStatus(form, 'Search for a location, select it on the map, or enter an address.', true);
    if (button) button.disabled = false;
    return;
  }

  const payload = new FormData();
  payload.append('type', isLost ? 'lost' : 'found');
  payload.append('name', nameInput?.value.trim() || '');
  payload.append('categoryId', categorySelect?.value || '');
  payload.append('description', descriptionInput?.value.trim() || '');
  payload.append('itemDate', dateInput?.value || '');
  payload.append('contactMethod', contactInput?.value.trim() || '');
  payload.append('location', JSON.stringify(location));
  [...(photoInput?.files || [])].slice(0, 5).forEach((file) => payload.append('images', file));

  try {
    const response = await fetch('/api/items', { method: 'POST', credentials: 'same-origin', body: payload });
    const result = await response.json();
    if (response.status === 401) { window.location.assign('/login'); return; }
    if (!response.ok) throw new Error(result.error || 'Could not submit report.');
    setStatus(form, 'Your report has been submitted. Opening the community listings…');
    window.setTimeout(() => window.location.assign('/explore'), 700);
  } catch (error) {
    setStatus(form, error.message || 'Unable to reach the server. Please try again.', true);
  } finally {
    if (button) button.disabled = false;
  }
}

function initializeReportForm(form, path) {
  if (form.dataset.reportBound === 'true') return () => {};
  form.dataset.reportBound = 'true';
  const isLost = path === '/report-lost';
  const inputs = form.querySelectorAll('input');
  const nameInput = [...inputs].find((input) => input.type === 'text');
  const dateInput = form.querySelector('input[type="date"]');
  const textInputs = [...inputs].filter((input) => input.type === 'text');
  const contactInput = textInputs.at(-1);
  const categorySelect = form.querySelector('select');
  const descriptionInput = form.querySelector('textarea');
  const photoInput = form.querySelector('input[type="file"]');
  if (nameInput) { nameInput.value = ''; nameInput.required = true; nameInput.placeholder = 'e.g. Black leather wallet'; }
  if (dateInput) { dateInput.value = ''; dateInput.required = true; }
  if (contactInput) { contactInput.value = ''; contactInput.required = true; contactInput.placeholder = 'Email or phone number'; }
  if (descriptionInput) { descriptionInput.value = ''; descriptionInput.required = true; descriptionInput.placeholder = 'Include details that can help identify the item.'; }
  if (categorySelect) {
    [...categorySelect.options].forEach((option) => { option.value = categoryIds.get(option.textContent.trim()) || '6'; });
    categorySelect.required = true;
  }
  if (photoInput) { photoInput.accept = 'image/jpeg,image/png,image/webp'; photoInput.multiple = true; }

  const locationSelector = createLocationSelector(form, photoInput);
  const onSubmit = (event) => { event.preventDefault(); submitReport(form, locationSelector, isLost); };
  form.addEventListener('submit', onSubmit);
  return () => {
    form.removeEventListener('submit', onSubmit);
    locationSelector.dispose();
    delete form.dataset.reportBound;
  };
}

export default function ReportBridge() {
  useEffect(() => {
    let cleanupPage = () => {};
    let currentPath = '';

    function initializePage() {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      if (path === currentPath) return;
      cleanupPage();
      cleanupPage = () => {};
      currentPath = path;
      if (['/report-lost', '/report-found'].includes(path)) {
        const form = document.querySelector('main form');
        if (form) cleanupPage = initializeReportForm(form, path);
      }
      if (path === '/explore') {
        const container = document.querySelector('main section.space-y-5');
        if (container && container.dataset.apiRendered !== 'true') {
          container.dataset.apiRendered = 'true';
          fetch('/api/items?limit=100')
            .then((response) => response.ok ? response.json() : Promise.reject(new Error('Could not load reports.')))
            .then((result) => renderItems(container, result.data || []))
            .catch(() => { container.dataset.apiRendered = 'false'; });
        }
      }
    }

    const observer = new MutationObserver(initializePage);
    observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
    initializePage();
    return () => { observer.disconnect(); cleanupPage(); };
  }, []);
  return null;
}
