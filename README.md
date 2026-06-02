# Raamatukogu REST API

RESTful API raamatukogu infosüsteemile. Ehitatud TypeScript + Node.js + Express.js.

## Autorid
- nspafka

## Installatsioonijuhised

```bash
npm install
```

### OSA 1 — Mock andmetega

```bash
npm run dev
```

Server käivitub pordil **3000**.

### OSA 2 — PostgreSQL

```bash
cp .env.example .env
# Täida .env failis andmebaasi andmed

npx prisma migrate dev
npx prisma db seed

npm run dev
```

## Käivitamise käsud

| Käsk | Kirjeldus |
|------|-----------|
| `npm run dev` | Arendusserver (ts-node-dev) |
| `npm run build` | Kompileeri TypeScript |
| `npm start` | Käivita kompileeritud versioon |
| `npx prisma migrate dev` | Käivita migratsioonid |
| `npx prisma db seed` | Sisesta algandmed |

## API Endpoint'id

### Raamatud
```
POST   /api/v1/books
GET    /api/v1/books
GET    /api/v1/books/:id
PUT    /api/v1/books/:id
DELETE /api/v1/books/:id
GET    /api/v1/books/:id/reviews
GET    /api/v1/books/:id/average-rating
```

### Autorid
```
POST   /api/v1/authors
GET    /api/v1/authors
GET    /api/v1/authors/:id
PUT    /api/v1/authors/:id
DELETE /api/v1/authors/:id
GET    /api/v1/authors/:id/books
```

### Kirjastused
```
POST   /api/v1/publishers
GET    /api/v1/publishers
GET    /api/v1/publishers/:id
PUT    /api/v1/publishers/:id
DELETE /api/v1/publishers/:id
GET    /api/v1/publishers/:id/books
```

### Arvustused
```
POST   /api/v1/books/:bookId/reviews
GET    /api/v1/books/:bookId/reviews
GET    /api/v1/reviews/:id
PUT    /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
```

### Žanrid
```
GET    /api/v1/genres
POST   /api/v1/genres
GET    /api/v1/genres/:id
GET    /api/v1/genres/:id/books
```

## cURL näited

```bash
# Kõik raamatud
curl http://localhost:3000/api/v1/books

# Raamat ID järgi
curl http://localhost:3000/api/v1/books/1

# Uus raamat
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Tõde ja õigus","isbn":"978-9985-3-0001-0","publishedYear":1926,"pageCount":412,"language":"eesti","authorId":1,"publisherId":1,"genres":[1]}'

# Otsi pealkirja järgi
curl "http://localhost:3000/api/v1/books?title=harry"

# Sorteeri ja pagineeri
curl "http://localhost:3000/api/v1/books?sortBy=publishedYear&order=desc&page=1&limit=5"

# Raamatu arvustused
curl http://localhost:3000/api/v1/books/1/reviews

# Keskmine hinne
curl http://localhost:3000/api/v1/books/1/average-rating
```
