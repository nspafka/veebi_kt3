import { Publisher } from '../models/Publisher';
import { publishers } from '../data';
import { CreatePublisherInput, UpdatePublisherInput } from '../validators/publisherValidator';

// Järgmise ID arvutamiseks
let nextId = Math.max(...publishers.map((p) => p.id)) + 1;

// Filtreerimise parameetrite tüüp
export interface PublisherQueryParams {
  name?: string;
  country?: string;
}

// Kõikide kirjastuste tagastamine koos filtreerimisega
export function getAllPublishers(params: PublisherQueryParams = {}): Publisher[] {
  let result = [...publishers];

  // Filtreerimine nime järgi — otsib osalist vastet
  if (params.name) {
    const nameLower = params.name.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(nameLower));
  }

  // Filtreerimine riigi järgi — otsib osalist vastet
  if (params.country) {
    const countryLower = params.country.toLowerCase();
    result = result.filter((p) => p.country.toLowerCase().includes(countryLower));
  }

  return result;
}

// Ühe kirjastuse otsimine ID järgi
export function getPublisherById(id: number): Publisher | undefined {
  return publishers.find((p) => p.id === id);
}

// Uue kirjastuse lisamine
export function createPublisher(input: CreatePublisherInput): Publisher {
  const newPublisher: Publisher = {
    id: nextId++,
    ...input,
    createdAt: new Date().toISOString(),
  };
  publishers.push(newPublisher);
  return newPublisher;
}

// Olemasoleva kirjastuse uuendamine
export function updatePublisher(id: number, input: UpdatePublisherInput): Publisher | undefined {
  const index = publishers.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const updated: Publisher = { ...publishers[index], ...input };
  publishers[index] = updated;
  return updated;
}

// Kirjastuse kustutamine ID järgi
export function deletePublisher(id: number): boolean {
  const index = publishers.findIndex((p) => p.id === id);
  if (index === -1) return false;

  publishers.splice(index, 1);
  return true;
}
