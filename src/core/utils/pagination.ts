export function getPaginationOffset(page: number, limit: number): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}
