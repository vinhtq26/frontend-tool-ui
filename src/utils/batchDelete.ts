export function formatBatchItems(items: unknown[]) {
  return items
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item);
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    })
    .join(', ');
}
