// Leheküljestamise abifunktsioonid — kasutatakse kõikides marsruutides

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Parsib lehekülje ja limiidi query parameetritest — tagastab kindlad vaikeväärtused kui parameetrid puuduvad
export function parsePagination(pageParam: unknown, limitParam: unknown): { page: number; limit: number } {
  // Vaikimisi esimene lehekülg, 10 kirjet lehel
  const page = Math.max(1, parseInt(String(pageParam ?? '1')) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(limitParam ?? '10')) || 10));
  return { page, limit };
}

// Rakendab leheküljestamist massiiviie — lõikab välja õige lõigu ja lisab metaandmed
export function paginate<T>(items: T[], page: number, limit: number): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);

  // Arvutame algus- ja lõppindeksi slice jaoks
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const data = items.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
