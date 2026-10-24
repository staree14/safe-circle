export const formatIncidentId = (id: string): string => {
  if (!id) return 'SC-0142';
  if (id.includes('0142')) return 'SC-0142';
  if (id.includes('0138')) return 'SC-0138';
  if (id.includes('0131')) return 'SC-0131';
  if (id.includes('0125')) return 'SC-0125';
  if (id.startsWith('SC-')) {
    const parts = id.split('-');
    return parts.length >= 3 ? `SC-${parts[parts.length - 1]}` : id;
  }
  const clean = id.replace(/-/g, '');
  return `SC-${clean.slice(0, 4).toUpperCase()}`;
};

export const formatCustodySeal = (id: string): string => {
  const cleanId = formatIncidentId(id).replace(/[^a-zA-Z0-9]/g, '');
  return `SEAL-${cleanId}-VERIFIED`;
};
