// Leheküljestamise abifunktsioonid — kasutatakse kõikides marsruutides

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Parsib lehekülje ja limiidi query parameetritest — tagastab vaikeväärtused kui parameetrid puuduvad
export function parsePagination(pageParam: unknown, limitParam: unknown): { page: number; limit: number } {
  // Vaikimisi esimene lehekülg, 10 kirjet lehel
  const page = Math.max(1, parseInt(String(pageParam ?? '1')) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(limitParam ?? '10')) || 10));
  return { page, limit };
}

// Ehitab leheküljestamise metaandmed andmebaasi päringu tulemuse põhjal
// Kasutatakse Prisma teenustes kus lehestamine toimub andmebaasi tasemel
export function buildPaginationMeta(totalItems: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// Rakendab leheküljestamist massiivis — kasutatakse väikeste andmekogumite puhul
export function paginate<T>(items: T[], page: number, limit: number): PaginationResult<T> {
  const totalItems = items.length;
  const meta = buildPaginationMeta(totalItems, page, limit);
  const startIndex = (page - 1) * limit;
  const data = items.slice(startIndex, startIndex + limit);
  return { data, pagination: meta };
}
