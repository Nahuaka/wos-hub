export function slugify(name, existingKeys = []) {
  let base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
  if (!base) base = 'account';
  let slug = base;
  let i = 2;
  while (existingKeys.includes(slug)) {
    slug = base + i;
    i++;
  }
  return slug;
}

export function initialOf(name) {
  const stripped = name.replace(/\[.*?\]/g, '').trim();
  return (stripped.charAt(0) || 'A').toUpperCase();
}

export function permissionClass(permission) {
  return permission.toLowerCase().replace(/\s+/g, '-');
}

export function eventSlug(name, existingIds = []) {
  let base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!base) base = 'event';
  let slug = base;
  let i = 2;
  while (existingIds.includes(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}
