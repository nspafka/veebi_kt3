# Raamatukogu REST API

RESTful API raamatukogu infosüsteemile — TypeScript + Express.js + Prisma + PostgreSQL.

**Autor:** nspafka &nbsp;|&nbsp; **Kursus:** RAM0541_2026_kevad &nbsp;|&nbsp; **Server:** `http://localhost:3000`

---

## Sisukord

- [Kiire alustamine](#kiire-alustamine)
- [Kõik käsud](#kõik-käsud)
- [Projektistruktuur](#projektistruktuur)
- [Andmemudelid](#andmemudelid)
- [Vastuse formaadid](#vastuse-formaadid)
- [API — Raamatud](#api--raamatud)
- [API — Autorid](#api--autorid)
- [API — Kirjastused](#api--kirjastused)
- [API — Arvustused](#api--arvustused)
- [API — Žanrid](#api--žanrid)
- [Veaolukordade käsitlemine](#veaolukordade-käsitlemine)
- [Git töövoog](#git-töövoog)

---

## Kiire alustamine

### OSA 1 — Mock andmetega (ei vaja andmebaasi)

```bash
npm install
npm run dev
```

Server käivitub pordil **3000**. Andmed on in-memory — taaskäivitusel lähevad kaotsi.

### OSA 2 — PostgreSQL andmebaasiga

```bash
npm install
npm run db:up          # käivita Postgres Dockeris
cp .env.example .env   # loo keskkonna muutujate fail
npm run db:migrate     # loo tabelid (sisesta migratsiooni nimi nt "init")
npm run db:seed        # sisesta algandmed
npm run dev
```

> Vajab: Node.js 20+ ja Docker Desktop

---

## Kõik käsud

| Käsk | Kirjeldus |
|------|-----------|
| `npm run dev` | Arendusserver (automaatne taaskäivitus) |
| `npm run build` | TypeScript kompileerimine |
| `npm start` | Kompileeritud versiooni käivitamine |
| `npm run db:up` | Käivita PostgreSQL Docker konteiner |
| `npm run db:down` | Peata Docker konteiner |
| `npm run db:migrate` | Käivita Prisma migratsioonid |
| `npm run db:seed` | Sisesta algandmed andmebaasi |
| `npm run db:studio` | Ava Prisma Studio (visuaalne andmebaasi vaade) |
| `npm run db:reset` | Lähtesta andmebaas (**kustutab kõik andmed!**) |

---

## Projektistruktuur

<details>
<summary>Näita struktuuri</summary>

```
src/
├── index.ts              # Serveri käivituspunkt
├── app.ts                # Express rakendus, marsruutide registreerimine
├── lib/
│   └── prisma.ts         # Prisma kliendi singleton
├── models/               # TypeScript liidesed andmemudelitele
├── data/                 # OSA 1 mock andmed (in-memory massiivid)
├── services/             # Äriloogika kiht
├── validators/           # Zod valideerimisskeemid
├── routes/               # Express marsruudid
├── middleware/
│   └── errorHandler.ts   # Globaalne veatöötleja, 404 käsitleja
└── utils/
    ├── pagination.ts     # Leheküljestamise abifunktsioonid
    ├── asyncHandler.ts   # Async marsruudi mähis
    └── prismaErrors.ts   # Prisma vigade teisendamine AppError-iks
prisma/
├── schema.prisma         # Andmebaasi skeemi definitsioon
├── seed.ts               # Algandmete sisestamise skript
└── migrations/           # Andmebaasi migratsioonid (versioonihalduses)
```

</details>

---

## Andmemudelid

<details>
<summary>Book (Raamat)</summary>

| Väli | Tüüp | Nõutav | Kirjeldus |
|------|------|--------|-----------|
| id | number | auto | Unikaalne identifikaator |
| title | string | ✓ | Pealkiri |
| isbn | string | ✓ | ISBN-10 või ISBN-13 (ainult numbrid) |
| publishedYear | number | ✓ | Avaldamisaasta |
| pageCount | number | ✓ | Lehekülgede arv |
| language | string | ✓ | Keel (nt `eesti`, `inglise`) |
| description | string | ✓ | Kirjeldus |
| coverImage | string | - | Kaanepildi URL (valikuline) |
| authorId | number | ✓ | Autori ID viide |
| publisherId | number | ✓ | Kirjastuse ID viide |
| genres | number[] | ✓ | Žanrite ID-de massiiv (vähemalt 1) |
| createdAt | string | auto | ISO 8601 |
| updatedAt | string | auto | ISO 8601 |

</details>

<details>
<summary>Author (Autor)</summary>

| Väli | Tüüp | Nõutav | Kirjeldus |
|------|------|--------|-----------|
| id | number | auto | Unikaalne identifikaator |
| firstName | string | ✓ | Eesnimi |
| lastName | string | ✓ | Perekonnanimi |
| birthYear | number | ✓ | Sünniaasta |
| nationality | string | ✓ | Rahvus |
| biography | string | - | Elulookirjeldus (valikuline) |
| createdAt | string | auto | ISO 8601 |

</details>

<details>
<summary>Publisher (Kirjastus)</summary>

| Väli | Tüüp | Nõutav | Kirjeldus |
|------|------|--------|-----------|
| id | number | auto | Unikaalne identifikaator |
| name | string | ✓ | Kirjastuse nimi |
| country | string | ✓ | Riik |
| foundedYear | number | ✓ | Asutamisaasta |
| website | string | - | Veebisaidi URL (valikuline) |
| createdAt | string | auto | ISO 8601 |

</details>

<details>
<summary>Review (Arvustus)</summary>

| Väli | Tüüp | Nõutav | Kirjeldus |
|------|------|--------|-----------|
| id | number | auto | Unikaalne identifikaator |
| bookId | number | ✓ | Raamatu ID viide |
| userName | string | ✓ | Kasutajanimi |
| rating | number | ✓ | Hinne 1–5 |
| comment | string | ✓ | Arvustuse tekst |
| createdAt | string | auto | ISO 8601 |

</details>

<details>
<summary>Genre (Žanr)</summary>

| Väli | Tüüp | Nõutav | Kirjeldus |
|------|------|--------|-----------|
| id | number | auto | Unikaalne identifikaator |
| name | string | ✓ | Žanri nimi (unikaalne) |

</details>

---

## Vastuse formaadid

<details>
<summary>Nimekiri koos leheküljestamisega</summary>

Kõik GET nimekirja endpoint-id tagastavad:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 12,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

</details>

<details>
<summary>Vea vastus</summary>

```json
{
  "error": "Vigased andmed",
  "details": [
    { "field": "isbn", "message": "Vigane ISBN formaat" }
  ]
}
```

| Kood | Millal |
|------|--------|
| 200 | Edukas GET / PUT |
| 201 | Edukas POST |
| 204 | Edukas DELETE |
| 400 | Vigane JSON, vigane ID, Zod valideerimise viga |
| 404 | Ressurssi ei leita, marsruut puudub |
| 409 | Duplikaat (sama ISBN, sama žanri nimi) |
| 500 | Ootamatu serveri viga |

</details>

---

## API — Raamatud

**Baas-URL:** `/api/v1/books`

<details>
<summary>Query parameetrid (GET /)</summary>

| Parameeter | Kirjeldus | Näide |
|------------|-----------|-------|
| `title` | Pealkirja osaline otsing | `?title=harry` |
| `author` | Autori nimi (ees- või perekonnanimi) | `?author=rowling` |
| `genre` | Žanri nimi | `?genre=fantaasia` |
| `language` | Keel (täpne vaste) | `?language=eesti` |
| `year` | Avaldamisaasta | `?year=1997` |
| `publisher` | Kirjastuse nimi | `?publisher=bloomsbury` |
| `sortBy` | `title` või `publishedYear` | `?sortBy=publishedYear` |
| `order` | `asc` või `desc` | `?order=desc` |
| `page` | Lehekülg (vaikimisi 1) | `?page=2` |
| `limit` | Kirjeid lehel, max 100 (vaikimisi 10) | `?limit=5` |

</details>

<details>
<summary>GET / — Kõik raamatud</summary>

```bash
# Kõik raamatud
curl http://localhost:3000/api/v1/books

# Filtreerimine
curl "http://localhost:3000/api/v1/books?title=harry"
curl "http://localhost:3000/api/v1/books?author=rowling"
curl "http://localhost:3000/api/v1/books?genre=fantaasia"
curl "http://localhost:3000/api/v1/books?language=eesti"
curl "http://localhost:3000/api/v1/books?year=1997"
curl "http://localhost:3000/api/v1/books?publisher=bloomsbury"

# Mitu filtrit korraga
curl "http://localhost:3000/api/v1/books?genre=fantaasia&language=inglise"

# Sorteerimine
curl "http://localhost:3000/api/v1/books?sortBy=publishedYear&order=desc"
curl "http://localhost:3000/api/v1/books?sortBy=title&order=asc"

# Leheküljestamine
curl "http://localhost:3000/api/v1/books?page=2&limit=5"
```

</details>

<details>
<summary>GET /:id — Üks raamat</summary>

```bash
curl http://localhost:3000/api/v1/books/7
```

**Vastus 200:**
```json
{
  "id": 7,
  "title": "Harry Potter and the Philosopher's Stone",
  "isbn": "9780747532743",
  "publishedYear": 1997,
  "pageCount": 223,
  "language": "inglise",
  "description": "Esimene raamat Harry Potteri sarjast...",
  "coverImage": null,
  "authorId": 4,
  "publisherId": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "author": { "id": 4, "firstName": "J.K.", "lastName": "Rowling", "birthYear": 1965, "nationality": "britlane", "biography": "...", "createdAt": "2024-01-01T00:00:00.000Z" },
  "publisher": { "id": 3, "name": "Bloomsbury", "country": "Suurbritannia", "foundedYear": 1986, "website": "https://www.bloomsbury.com", "createdAt": "2024-01-01T00:00:00.000Z" },
  "genres": [{ "id": 4, "name": "Fantaasia" }, { "id": 6, "name": "Lasteraamat" }]
}
```

</details>

<details>
<summary>POST / — Uus raamat</summary>

```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kevade",
    "isbn": "9789985301096",
    "publishedYear": 1912,
    "pageCount": 320,
    "language": "eesti",
    "description": "Oskar Lutsu humoristlik romaan koolipõlvest.",
    "authorId": 1,
    "publisherId": 1,
    "genres": [1]
  }'
```

**Vastus 201:** tagastab loodud raamatu täielikult (sh autor, kirjastus, žanrid).

**Vastus 400:**
```json
{
  "error": "Vigased andmed",
  "details": [{ "field": "isbn", "message": "Vigane ISBN formaat" }]
}
```

</details>

<details>
<summary>PUT /:id — Uuenda raamatut</summary>

Kõik väljad valikulised — saada ainult muudetavad.

```bash
curl -X PUT http://localhost:3000/api/v1/books/1 \
  -H "Content-Type: application/json" \
  -d '{ "pageCount": 415, "description": "Uuendatud kirjeldus." }'
```

**Vastus 200:** tagastab uuendatud raamatu täielikult.

</details>

<details>
<summary>DELETE /:id — Kustuta raamat</summary>

Kustutab raamatu koos kõikide selle arvustustega (cascade delete).

```bash
curl -X DELETE http://localhost:3000/api/v1/books/1
```

**Vastus 204:** tühi vastus.

</details>

<details>
<summary>POST /:id/reviews — Lisa arvustus</summary>

```bash
curl -X POST http://localhost:3000/api/v1/books/7/reviews \
  -H "Content-Type: application/json" \
  -d '{ "userName": "peeter_lugeja", "rating": 4, "comment": "Väga hea raamat!" }'
```

**Vastus 201:**
```json
{
  "id": 14,
  "bookId": 7,
  "userName": "peeter_lugeja",
  "rating": 4,
  "comment": "Väga hea raamat!",
  "createdAt": "2024-06-02T10:00:00.000Z"
}
```

</details>

<details>
<summary>GET /:id/reviews — Raamatu arvustused</summary>

| Parameeter | Kirjeldus |
|------------|-----------|
| `rating` | Filtreeri täpse hinde järgi (1–5) |
| `sortBy` | `createdAt` |
| `order` | `asc` või `desc` (vaikimisi `desc`) |

```bash
curl http://localhost:3000/api/v1/books/7/reviews
curl "http://localhost:3000/api/v1/books/7/reviews?rating=5"
curl "http://localhost:3000/api/v1/books/7/reviews?sortBy=createdAt&order=asc"
```

</details>

<details>
<summary>GET /:id/average-rating — Keskmine hinne</summary>

```bash
curl http://localhost:3000/api/v1/books/7/average-rating
```

**Vastus 200:**
```json
{ "bookId": 7, "averageRating": 4.5 }
```

**Vastus kui arvustusi pole:**
```json
{ "bookId": 99, "averageRating": null }
```

</details>

---

## API — Autorid

**Baas-URL:** `/api/v1/authors`

<details>
<summary>Query parameetrid</summary>

| Parameeter | Kirjeldus |
|------------|-----------|
| `lastName` | Perekonnanime osaline otsing |
| `nationality` | Rahvuse osaline otsing |
| `sortBy` | `lastName` |
| `order` | `asc` või `desc` |
| `page` / `limit` | Leheküljestamine |

</details>

<details>
<summary>Kõik endpoint-id</summary>

```bash
# Kõik autorid
curl http://localhost:3000/api/v1/authors

# Filtreerimine
curl "http://localhost:3000/api/v1/authors?lastName=rowling"
curl "http://localhost:3000/api/v1/authors?nationality=britlane"
curl "http://localhost:3000/api/v1/authors?sortBy=lastName&order=asc"

# Üks autor
curl http://localhost:3000/api/v1/authors/4

# Uus autor
curl -X POST http://localhost:3000/api/v1/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Oskar",
    "lastName": "Luts",
    "birthYear": 1887,
    "nationality": "eestlane",
    "biography": "Eesti kirjanik, tuntud humoristlike teoste autor."
  }'

# Uuenda autorit
curl -X PUT http://localhost:3000/api/v1/authors/1 \
  -H "Content-Type: application/json" \
  -d '{ "biography": "Uuendatud elulookirjeldus." }'

# Kustuta autor (NB! ebaõnnestub kui autoril on raamatud — 409)
curl -X DELETE http://localhost:3000/api/v1/authors/1

# Autori raamatud
curl http://localhost:3000/api/v1/authors/1/books
```

</details>

---

## API — Kirjastused

**Baas-URL:** `/api/v1/publishers`

<details>
<summary>Query parameetrid</summary>

| Parameeter | Kirjeldus |
|------------|-----------|
| `name` | Nime osaline otsing |
| `country` | Riigi osaline otsing |
| `page` / `limit` | Leheküljestamine |

</details>

<details>
<summary>Kõik endpoint-id</summary>

```bash
# Kõik kirjastused
curl http://localhost:3000/api/v1/publishers
curl "http://localhost:3000/api/v1/publishers?country=Eesti"
curl "http://localhost:3000/api/v1/publishers?name=bloomsbury"

# Üks kirjastus
curl http://localhost:3000/api/v1/publishers/3

# Uus kirjastus
curl -X POST http://localhost:3000/api/v1/publishers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Varrak",
    "country": "Eesti",
    "foundedYear": 1991,
    "website": "https://www.varrak.ee"
  }'

# Uuenda kirjastust
curl -X PUT http://localhost:3000/api/v1/publishers/1 \
  -H "Content-Type: application/json" \
  -d '{ "website": "https://www.avita.ee/uus" }'

# Kustuta kirjastus (NB! ebaõnnestub kui kirjastusel on raamatud — 409)
curl -X DELETE http://localhost:3000/api/v1/publishers/1

# Kirjastuse raamatud
curl http://localhost:3000/api/v1/publishers/3/books
```

</details>

---

## API — Arvustused

**Baas-URL:** `/api/v1/reviews`

<details>
<summary>Kõik endpoint-id</summary>

```bash
# Üks arvustus
curl http://localhost:3000/api/v1/reviews/5

# Uuenda arvustust
curl -X PUT http://localhost:3000/api/v1/reviews/5 \
  -H "Content-Type: application/json" \
  -d '{ "rating": 4, "comment": "Uuendatud kommentaar." }'

# Kustuta arvustus
curl -X DELETE http://localhost:3000/api/v1/reviews/5
```

> POST ja GET arvustuste jaoks käib läbi raamatu: `POST /api/v1/books/:id/reviews`

</details>

---

## API — Žanrid

**Baas-URL:** `/api/v1/genres`

<details>
<summary>Kõik endpoint-id</summary>

```bash
# Kõik žanrid (tähestikulises järjekorras)
curl http://localhost:3000/api/v1/genres

# Uus žanr (NB! duplikaatnimi tagastab 409)
curl -X POST http://localhost:3000/api/v1/genres \
  -H "Content-Type: application/json" \
  -d '{ "name": "Biograafia" }'

# Üks žanr
curl http://localhost:3000/api/v1/genres/4

# Žanri raamatud
curl http://localhost:3000/api/v1/genres/4/books
```

</details>

---

## Veaolukordade käsitlemine

<details>
<summary>Näited vigadest</summary>

```bash
# Vigane JSON kehas → 400
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d 'see ei ole json'

# Vastus:
# { "error": "Vigane JSON formaat", "details": [{ "field": "body", "message": "Päringu keha ei ole kehtiv JSON" }] }

# Vigane ID → 400
curl http://localhost:3000/api/v1/books/abc
# { "error": "Vigane ID formaat" }

# Olematu ressurss → 404
curl http://localhost:3000/api/v1/books/99999
# { "error": "Raamatut ei leitud" }

# Olematu marsruut → 404
curl http://localhost:3000/api/v1/olematu
# { "error": "Marsruuti ei leitud: GET /api/v1/olematu" }

# Serveri tervisekontroll
curl http://localhost:3000/api/v1/health
# { "status": "ok" }
```

</details>

---

## Git töövoog

<details>
<summary>Harude ajalugu</summary>

| Haru | Sisu |
|------|------|
| `kt3_init` | Repo initsialiseerimine, .gitignore, README |
| `feature/project-setup` | package.json, tsconfig, Express skelett |
| `feature/models-validators` | TypeScript liidesed, Zod skeemid |
| `feature/mock-data` | In-memory mock andmed |
| `feature/books-crud` | Raamatute CRUD endpoint-id |
| `feature/authors-publishers` | Autorite ja kirjastuste CRUD |
| `feature/reviews-genres` | Arvustuste ja žanrite endpoint-id |
| `feature/query-sort-pagination` | Filtreerimine, sorteerimine, leheküljestamine |
| `feature/error-handling` | Veatöötleja middleware |
| `feature/prisma-setup` | Prisma skeem, migratsioonid, seed, Docker |
| `feature/prisma-integration` | Mock teenuste asendamine Prismaga |
| `feature/documentation` | README, API dokumentatsioon |

</details>
