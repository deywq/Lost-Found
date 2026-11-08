import { useEffect } from 'react';

const categoryIds = new Map([
  ['Accessories', '1'], ['Bags', '2'], ['Documents', '3'], ['Electronics', '4'],
  ['Keys', '5'], ['Other', '6'], ['Wallets', '7'],
]);

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

function renderItems(container, items) {
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'rounded-2xl border border-slate-200 bg-white p-6 text-slate-600';
    empty.textContent = 'No reports have been posted yet.';
    container.append(empty);
    return;
  }
  for (const item of items) {
    const article = document.createElement('article');
    article.className = 'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm';
    const row = document.createElement('div');
    row.className = 'grid gap-4 md:grid-cols-[220px_1fr]';
    if (item.image) {
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.name;
      image.className = 'h-48 w-full object-cover md:h-full';
      row.append(image);
    }
    const content = document.createElement('div');
    content.className = 'p-5';
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-slate-900';
    title.textContent = item.name;
    const description = document.createElement('p');
    description.className = 'mt-2 text-sm leading-6 text-slate-600';
    description.textContent = item.description;
    const details = document.createElement('p');
    details.className = 'mt-4 text-sm text-slate-500';
    details.textContent = `${item.type} · ${item.category} · ${item.location || 'Location not provided'} · ${item.itemDate}`;
    content.append(title, description, details);
    row.append(content);
    article.append(row);
    container.append(article);
  }
}

export default function ReportBridge() {
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const form = ['/report-lost', '/report-found'].includes(path) ? document.querySelector('main form') : null;
    let cleanup = () => {};

    if (form) {
      const inputs = form.querySelectorAll('input');
      const nameInput = [...inputs].find((input) => input.type === 'text');
      const dateInput = form.querySelector('input[type="date"]');
      const contactInput = [...inputs].filter((input) => input.type === 'text').at(-1);
      const categorySelect = form.querySelector('select');
      const descriptionInput = form.querySelector('textarea');
      const photoInput = form.querySelector('input[type="file"]');
      const isLost = path === '/report-lost';

      if (nameInput) { nameInput.value = ''; nameInput.required = true; nameInput.placeholder = 'e.g. Black leather wallet'; }
      if (dateInput) { dateInput.value = ''; dateInput.required = true; }
      if (contactInput) { contactInput.value = ''; contactInput.required = true; contactInput.placeholder = 'Email or phone number'; }
      if (descriptionInput) { descriptionInput.value = ''; descriptionInput.required = true; descriptionInput.placeholder = 'Include details that can help identify the item.'; }
      if (categorySelect) {
        [...categorySelect.options].forEach((option) => {
          option.value = categoryIds.get(option.textContent.trim()) || '6';
        });
        categorySelect.required = true;
      }
      if (photoInput) {
        photoInput.accept = 'image/jpeg,image/png,image/webp';
        photoInput.multiple = true;
      }

      let locationInput = form.querySelector('[data-report-location]');
      if (!locationInput) {
        const label = document.createElement('label');
        label.className = 'block';
        const caption = document.createElement('span');
        caption.className = 'mb-2 block text-sm font-medium text-slate-600';
        caption.textContent = 'Location';
        locationInput = document.createElement('input');
        locationInput.type = 'text';
        locationInput.dataset.reportLocation = 'true';
        locationInput.required = true;
        locationInput.placeholder = 'Street, school, mall, barangay, or city';
        locationInput.className = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white';
        label.append(caption, locationInput);
        const filePanel = photoInput?.closest('.rounded-2xl');
        if (filePanel) form.insertBefore(label, filePanel);
        else form.append(label);
      }

      const submit = async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const button = form.querySelector('button[type="submit"]');
        if (button) button.disabled = true;
        const payload = new FormData();
        payload.append('type', isLost ? 'lost' : 'found');
        payload.append('name', nameInput.value.trim());
        payload.append('categoryId', categorySelect.value);
        payload.append('description', descriptionInput.value.trim());
        payload.append('itemDate', dateInput.value);
        payload.append('contactMethod', contactInput.value.trim());
        payload.append('location', JSON.stringify({ address: locationInput.value.trim() }));
        [...(photoInput?.files || [])].slice(0, 5).forEach((file) => payload.append('images', file));

        try {
          const response = await fetch('/api/items', { method: 'POST', credentials: 'same-origin', body: payload });
          const result = await response.json();
          if (response.status === 401) {
            window.location.assign('/login');
            return;
          }
          if (!response.ok) throw new Error(result.error || 'Could not submit report.');
          setStatus(form, 'Your report has been submitted. Opening the community listings…');
          window.setTimeout(() => window.location.assign('/explore'), 700);
        } catch (error) {
          setStatus(form, error.message || 'Unable to reach the server. Please try again.', true);
        } finally {
          if (button) button.disabled = false;
        }
      };
      form.addEventListener('submit', submit);
      cleanup = () => form.removeEventListener('submit', submit);
    }

    if (path === '/explore') {
      const container = document.querySelector('main section.space-y-5');
      if (container) {
        fetch('/api/items?limit=100')
          .then((response) => response.json())
          .then((result) => renderItems(container, result.data || []))
          .catch(() => {});
      }
    }
    return cleanup;
  }, []);
  return null;
}
