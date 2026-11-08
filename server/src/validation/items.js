const allowedTypes = new Set(['lost', 'found']);
const allowedImageHosts = /^https?:\/\//i;

function validateNewItem(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const { type, name, description = '', categoryId, itemDate, contactMethod = null } = body;
  if (!allowedTypes.has(type)) return { error: 'type must be lost or found' };
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 150) {
    return { error: 'name must be between 2 and 150 characters' };
  }
  if (typeof description !== 'string' || description.length > 5000) {
    return { error: 'description must be a string of at most 5000 characters' };
  }

  const parsedCategoryId = Number(categoryId);
  if (!Number.isSafeInteger(parsedCategoryId) || parsedCategoryId < 1) {
    return { error: 'categoryId must be a positive integer' };
  }

  if (typeof itemDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(itemDate)) {
    return { error: 'itemDate must use YYYY-MM-DD format' };
  }
  const parsedDate = new Date(`${itemDate}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== itemDate) {
    return { error: 'itemDate must be a valid calendar date' };
  }

  if (contactMethod !== null && (typeof contactMethod !== 'string' || contactMethod.length > 255)) {
    return { error: 'contactMethod must be a string of at most 255 characters' };
  }

  const userId = body.userId === undefined || body.userId === null ? null : Number(body.userId);
  if (userId !== null && (!Number.isSafeInteger(userId) || userId < 1)) {
    return { error: 'userId must be a positive integer' };
  }

  let location = null;
  if (body.location !== undefined && body.location !== null) {
    const candidate = body.location;
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return { error: 'location must be an object' };
    }
    const { address, latitude, longitude } = candidate;
    if (typeof address !== 'string' || !address.trim() || address.length > 500) {
      return { error: 'location.address must be between 1 and 500 characters' };
    }
    if (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
      return { error: 'location.latitude must be between -90 and 90' };
    }
    if (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
      return { error: 'location.longitude must be between -180 and 180' };
    }
    if ((latitude === undefined) !== (longitude === undefined)) {
      return { error: 'location.latitude and location.longitude must be provided together' };
    }
    location = {
      address: address.trim(),
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    };
  }

  const images = body.images === undefined ? [] : body.images;
  if (!Array.isArray(images) || images.length > 10) {
    return { error: 'images must be an array with no more than 10 entries' };
  }
  const cleanImages = [];
  for (const image of images) {
    if (!image || typeof image !== 'object' || Array.isArray(image)
      || typeof image.url !== 'string' || image.url.length > 2048 || !allowedImageHosts.test(image.url)
      || (image.altText !== undefined && (typeof image.altText !== 'string' || image.altText.length > 255))) {
      return { error: 'each image requires an http(s) url and optional altText up to 255 characters' };
    }
    cleanImages.push({ url: image.url, altText: image.altText?.trim() || null });
  }

  return {
    value: {
      type,
      name: name.trim(),
      description: description.trim(),
      categoryId: parsedCategoryId,
      itemDate,
      contactMethod: contactMethod?.trim() || null,
      userId,
      location,
      images: cleanImages,
    },
  };
}

module.exports = { validateNewItem };
