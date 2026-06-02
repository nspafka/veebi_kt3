## Üldinfo

| | |
|---|---|
| **Nimi** | Pavel Sarapov |
| **Meeskond / projekt** | Iseseisev töö |
| **Ülesanne / projekti osa** | Kõik |

---

## AI ja abivahendite kasutamine

### Milliseid tööriistu kasutasid?

- **Claude Code (Anthropic)** — peamine arendustööriist, kasutatud läbi VSCode laienduse
- **VSCode** — koodiredaktor koos Claude Code integratsiooniga
- **Stack Overflow** — konkreetsete tehniliste küsimuste kontrollimiseks (nt Prisma N:M seoste süntaks, Express async error handling muster)

---

### Too 2–3 näidet AI-prompt'idest, mida kasutasid

**1. Agendi seadistamine (enne esimest koodirida)**

Enne arenduse alustamist koostasin põhjaliku `CLAUDE.md` faili — andmemudelid, kõik endpoint'id, vastuse formaadid, harude plaan, keele nõuded (eestikeelne kasutajaliides, kommentaarid eesti keeles), TypeScript piirangud (`no any`). See oli sisuliselt agendi "treenimine": agent luges spetsifikatsiooni ja töötas selle järgi kogu projekti vältel.

**2. Harude käivitamine**

Iga funktsiooniharu jaoks kasutasin lühikest prompt'i, nt:
> `feature/books-crud — ready`

Agent kontrollis ise aktiivse haru (`git branch --show-current`), lõi kõik vajalikud failid ning andis lõpus PR pealkirja koos kirjeldusega — kõike käskude vahel polnud vaja selgitada, sest kontekst oli CLAUDE.md-s olemas.

**3. Arhitektuuriotsused läbirääkimiste teel**

Prisma integratsiooni faasis küsisin:
> `do you require postgre server? or how that will be handled?`

Agent selgitas kolme varianti (lokaalne Postgres, Docker, pilveteenus), soovitas Dockerit ja põhjendas miks — see teenib ka boonuspunkte ning teeb projekti self-contained. Tegin otsuse ise, agent täitis.

---

### Millised koodiosad olid täielikult sinu enda kirjutatud?

- **`CLAUDE.md`** — kõik projekti juhised, arhitektuuriotsused, harude plaan ja reeglid kirjutasin ise enne AI kasutamist. See dokument oli sisuliselt "spec", mille järgi AI töötas.
- **`AI_USAGE.md`** — see dokument.
- Kõik **git operatsioonid** (branch loomine, commit'imine, merge) tegin käsitsi.

---

### Milliseid AI poolt genereeritud lahendusi pidid parandama või ümber kirjutama?

Suuri ümbertöötlusi ei olnud, kuna CLAUDE.md setup oli väga põhjalik. Üks tähelepanuväärne hetk: `genreService.ts` esimeses versioonis oli duplikaatide käsitlemine vales kohas (teenuses, mitte marsruudis). Agent märkas seda iseseisvalt järgmise käsu peale ja kirjutas kohe üle ilma et oleksin pidanud kommenteerima.

---

### Millise probleemi lahendamisel aitas AI kõige rohkem?

**Prisma integratsioon OSA 2 jaoks** — eriti async/await mustri rakendamine kõikidesse marsruutidesse, Prisma `where` klauslite ehitamine dünaamiliste filtrite jaoks, ning `P2025`/`P2002`/`P2003` veakoodide korrektselt `AppError`-iks teisendamine. See oleks käsitsi kirjutades võtnud mitu tundi.

---

### Mida õppisid selle ülesande / projekti käigus tehniliselt?

Kuidas struktureerida AI-juhitud arendust nii, et tulemus oleks kontrollitud ja kvaliteetne — mitte "vibe coding" tavalises mõttes, vaid põhjalik eeltöö (spec, reeglid, harude plaan), mille järel AI täidab ülesandeid täpselt. Õppisin ka Prisma ORM-i sügavamalt (N:M seosed, aggregate päringud, cascade delete, migratsioonid) ning Express.js async veatöötluse mustrit.

---

## Enesehinnang

**☑ Vibe Coding** &nbsp; ☐ Mixed &nbsp; ☐ Deep Coding

Kood on valdavalt AI genereeritud, kuid protsess ei olnud passiivne. Enne arenduse alustamist investeerisin märkimisväärse aja täpse spetsifikatsiooni (`CLAUDE.md`), agendi mälu seadistamise ja iga haru juhiste kirjutamisse. Tulemus peegeldab seda eeltööd: AI töötas täpselt etteantud piirangute ja arhitektuuri järgi, mitte "arva ise mis ma tahan" režiimis.
