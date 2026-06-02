import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Algandmete sisestamine alustab...');

  // Kustutame olemasolevad andmed õiges järjekorras (välisviidete tõttu)
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();

  // Žanrite loomine
  console.log('Loome žanrid...');
  const [romaan, luule, ajalugu, fantaasia, teaduslik, lasteraamat, põnevus] =
    await Promise.all([
      prisma.genre.create({ data: { name: 'Romaan' } }),
      prisma.genre.create({ data: { name: 'Luule' } }),
      prisma.genre.create({ data: { name: 'Ajalugu' } }),
      prisma.genre.create({ data: { name: 'Fantaasia' } }),
      prisma.genre.create({ data: { name: 'Teaduslik' } }),
      prisma.genre.create({ data: { name: 'Lasteraamat' } }),
      prisma.genre.create({ data: { name: 'Põnevus' } }),
    ]);

  // Autorite loomine
  console.log('Loome autorid...');
  const [tammsaare, kross, koidula, rowling, orwell, marquez] = await Promise.all([
    prisma.author.create({
      data: {
        firstName: 'Anton',
        lastName: 'Hansen Tammsaare',
        birthYear: 1878,
        nationality: 'eestlane',
        biography: 'Eesti kirjanduse suurkuju, tuntud eelkõige romaanitsükli "Tõde ja õigus" poolest.',
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Jaan',
        lastName: 'Kross',
        birthYear: 1920,
        nationality: 'eestlane',
        biography: 'Eesti kirjanik ja poliitik, tuntud ajalooliste romaanide autor.',
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Lydia',
        lastName: 'Koidula',
        birthYear: 1843,
        nationality: 'eestlane',
        biography: 'Eesti rahvuslik naiskirjanik ja luuletaja.',
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'J.K.',
        lastName: 'Rowling',
        birthYear: 1965,
        nationality: 'britlane',
        biography: 'Briti kirjanik, tuntud Harry Potteri raamatusarja autor.',
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'George',
        lastName: 'Orwell',
        birthYear: 1903,
        nationality: 'britlane',
        biography: 'Briti kirjanik ja ajakirjanik, tuntud teoste "1984" ja "Loomafarm" autor.',
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Gabriel',
        lastName: 'García Márquez',
        birthYear: 1927,
        nationality: 'kolumblane',
        biography: 'Kolumbia kirjanik ja Nobeli kirjanduspreemia laureaat, maagilise realismi pioneer.',
      },
    }),
  ]);

  // Kirjastuste loomine
  console.log('Loome kirjastused...');
  const [avita, tanapäev, bloomsbury, penguin] = await Promise.all([
    prisma.publisher.create({
      data: { name: 'Avita', country: 'Eesti', foundedYear: 1991, website: 'https://www.avita.ee' },
    }),
    prisma.publisher.create({
      data: { name: 'Tänapäev', country: 'Eesti', foundedYear: 1999 },
    }),
    prisma.publisher.create({
      data: { name: 'Bloomsbury', country: 'Suurbritannia', foundedYear: 1986, website: 'https://www.bloomsbury.com' },
    }),
    prisma.publisher.create({
      data: { name: 'Penguin Books', country: 'Suurbritannia', foundedYear: 1935, website: 'https://www.penguin.co.uk' },
    }),
  ]);

  // Raamatute loomine koos žanrite seostamisega
  console.log('Loome raamatud...');
  const [tt1, tt2, tt3, keisri, uuringu, oobik, hp1, hp2, orwell1984, loomafarm, saada, armastus] =
    await Promise.all([
      prisma.book.create({
        data: {
          title: 'Tõde ja õigus I',
          isbn: '9789985301010',
          publishedYear: 1926,
          pageCount: 412,
          language: 'eesti',
          description: 'Tammsaare romaanitsükli esimene osa, mis kujutab Vargamäe talu elu ja võitlust maaga.',
          authorId: tammsaare.id,
          publisherId: avita.id,
          genres: { connect: [{ id: romaan.id }, { id: ajalugu.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Tõde ja õigus II',
          isbn: '9789985301027',
          publishedYear: 1929,
          pageCount: 389,
          language: 'eesti',
          description: 'Romaanitsükli teine osa, mis käsitleb Andrese poja Indrek Paasi lugu.',
          authorId: tammsaare.id,
          publisherId: avita.id,
          genres: { connect: [{ id: romaan.id }, { id: ajalugu.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Tõde ja õigus III',
          isbn: '9789985301034',
          publishedYear: 1931,
          pageCount: 356,
          language: 'eesti',
          description: 'Kolmas osa, kus Indrek Paas otsib elu mõtet ja oma kohta ühiskonnas.',
          authorId: tammsaare.id,
          publisherId: avita.id,
          genres: { connect: [{ id: romaan.id }, { id: ajalugu.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Keisri hull',
          isbn: '9789985301041',
          publishedYear: 1978,
          pageCount: 280,
          language: 'eesti',
          description: 'Jaan Krossi ajalooline romaan Timotheus von Bocki loost Eestis 19. sajandil.',
          authorId: kross.id,
          publisherId: tanapäev.id,
          genres: { connect: [{ id: romaan.id }, { id: ajalugu.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Uuringu päevik',
          isbn: '9789985301058',
          publishedYear: 1985,
          pageCount: 312,
          language: 'eesti',
          description: 'Jaan Krossi romaan, mis põimib ajaloo ja isikliku saatuse.',
          authorId: kross.id,
          publisherId: tanapäev.id,
          genres: { connect: [{ id: romaan.id }, { id: ajalugu.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Emajõe ööbik',
          isbn: '9789985301065',
          publishedYear: 1867,
          pageCount: 124,
          language: 'eesti',
          description: 'Lydia Koidula luulekogu, mis on üks olulisemaid eesti rahvuslikke luuleteoseid.',
          authorId: koidula.id,
          publisherId: avita.id,
          genres: { connect: [{ id: luule.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: "Harry Potter and the Philosopher's Stone",
          isbn: '9780747532743',
          publishedYear: 1997,
          pageCount: 223,
          language: 'inglise',
          description: 'Esimene raamat Harry Potteri sarjast, kus noormees avastab oma nõiaväe.',
          authorId: rowling.id,
          publisherId: bloomsbury.id,
          genres: { connect: [{ id: fantaasia.id }, { id: lasteraamat.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Harry Potter and the Chamber of Secrets',
          isbn: '9780747538493',
          publishedYear: 1998,
          pageCount: 251,
          language: 'inglise',
          description: 'Teine raamat Harry Potteri sarjast, kus avatakse Saladuste Kambri saladus.',
          authorId: rowling.id,
          publisherId: bloomsbury.id,
          genres: { connect: [{ id: fantaasia.id }, { id: lasteraamat.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: '1984',
          isbn: '9780141036144',
          publishedYear: 1949,
          pageCount: 328,
          language: 'inglise',
          description: 'George Orwelli düstoopilne romaan totalitaarsest ühiskonnast ja järelevalveriigist.',
          authorId: orwell.id,
          publisherId: penguin.id,
          genres: { connect: [{ id: romaan.id }, { id: põnevus.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Animal Farm',
          isbn: '9780141036137',
          publishedYear: 1945,
          pageCount: 112,
          language: 'inglise',
          description: 'Orwelli allegooriline novell, mis kujutab revolutsiooni ja võimu korrumpeerumist.',
          authorId: orwell.id,
          publisherId: penguin.id,
          genres: { connect: [{ id: romaan.id }, { id: põnevus.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Ükssada aastat üksindust',
          isbn: '9789985301072',
          publishedYear: 1967,
          pageCount: 448,
          language: 'eesti',
          description: 'García Márquezi magistraalromaan Buendía suguvõsa seitsmest põlvkonnast Macondos.',
          authorId: marquez.id,
          publisherId: tanapäev.id,
          genres: { connect: [{ id: romaan.id }, { id: fantaasia.id }] },
        },
      }),
      prisma.book.create({
        data: {
          title: 'Armastus koolera ajal',
          isbn: '9789985301089',
          publishedYear: 1985,
          pageCount: 368,
          language: 'eesti',
          description: 'García Márquezi romaan igavesest armastusest ja aja möödumisest.',
          authorId: marquez.id,
          publisherId: tanapäev.id,
          genres: { connect: [{ id: romaan.id }] },
        },
      }),
    ]);

  // Arvustuste loomine
  console.log('Loome arvustused...');
  await prisma.review.createMany({
    data: [
      { bookId: tt1.id, userName: 'mari_lugeja', rating: 5, comment: 'Eesti kirjanduse absoluutne tipp. Tammsaare kirjeldab Vargamäe elu nii elavalt, et tunned end seal olevat.' },
      { bookId: tt1.id, userName: 'juhan_raamatuuss', rating: 4, comment: 'Suurepärane teos, kuid kohati liialt aeglane tempo. Siiski kohustuslik lugemine igale eestlasele.' },
      { bookId: tt2.id, userName: 'kati_k', rating: 5, comment: 'Indrek Paasi lugu on väga liigutav. Parim osa tervest sarjast.' },
      { bookId: keisri.id, userName: 'peeter_ajaloohuvi', rating: 5, comment: 'Keisri hull on Krossi parim teos. Ajalugu ja isiklik draama põimuvad suurepäraselt.' },
      { bookId: hp1.id, userName: 'harry_fan', rating: 5, comment: 'Klassika! Lugesin seda lapsena ja nüüd uuesti täiskasvanuna — ikka sama võluv.' },
      { bookId: hp1.id, userName: 'siiri_s', rating: 4, comment: 'Väga hea lasteraamat, kuid täiskasvanutele võib liiga lihtne tunduda.' },
      { bookId: hp2.id, userName: 'harry_fan', rating: 5, comment: 'Teine osa on veel parem kui esimene! Saladuste Kamber on lummav.' },
      { bookId: orwell1984.id, userName: 'orwell_austaja', rating: 5, comment: '1984 on üks olulisemaid raamatuid, mida olen lugenud. Väga aktuaalne tänaseski päevas.' },
      { bookId: orwell1984.id, userName: 'mati_mõtleja', rating: 4, comment: 'Häiriv ja geniaalne. Orwell nägi tulevikku ette.' },
      { bookId: loomafarm.id, userName: 'liisa_lugeja', rating: 5, comment: 'Lühike aga tabav. Loomafarm ütleb rohkem kui paljud pikad romaanid.' },
      { bookId: saada.id, userName: 'marquez_fan', rating: 5, comment: 'Maagiline realism oma parimas vormis. Buendía pere lugu on unustamatu.' },
      { bookId: saada.id, userName: 'tiina_t', rating: 3, comment: 'Huvitav, kuid kohati segane. Nii palju tegelasi on raske jälgida.' },
      { bookId: armastus.id, userName: 'romantic_reader', rating: 5, comment: 'Sügavalt liigutav armastuslugu. García Márquez on lihtsalt meister.' },
    ],
  });

  console.log('Algandmete sisestamine lõpetatud!');
  console.log(`Loodud: 7 žanrit, 6 autorit, 4 kirjastust, 12 raamatut, 13 arvustust`);

  // Kasutamata muutujad — viidatud ainult seed kontekstis
  void [tt3, uuringu, oobik];
  void teaduslik;
}

// Käivitame seedi ja suleme ühenduse
main()
  .catch((e) => {
    console.error('Viga algandmete sisestamisel:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
