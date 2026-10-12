# Vragen MHC HBS

Een eenvoudige site met antwoorden op de vragen die steeds terugkomen in de appgroepen van MHC HBS. Vrijwilligers kunnen dan antwoorden met een link in plaats van alles opnieuw te typen.

- Elke vraag is een eigen pagina met een vast adres, bijvoorbeeld `/wedstrijden/hoe-werkt-het-dwf`. Dat adres delen mensen in WhatsApp, dus het verandert nooit.
- Commissieleden bewerken vragen via een webformulier op `/admin`. Ze hebben alleen een (gratis) GitHub-account nodig.
- Geen database, geen analytics, geen accounts behalve GitHub voor wie bewerkt.

## Inhoud

1. [Een vraag toevoegen of bewerken via /admin](#een-vraag-toevoegen-of-bewerken-via-admin)
2. [Drie regels voor een goed antwoord](#drie-regels-voor-een-goed-antwoord)
3. [Iemand bewerkrechten geven](#iemand-bewerkrechten-geven)
4. [Een categorie of eigenaar toevoegen](#een-categorie-of-eigenaar-toevoegen)
5. [Lokaal draaien](#lokaal-draaien)
6. [Uitrollen op Vercel](#uitrollen-op-vercel)
7. [Omgevingsvariabelen](#omgevingsvariabelen)
8. [GitHub OAuth App registreren](#github-oauth-app-registreren)
9. [Hoe het in elkaar zit](#hoe-het-in-elkaar-zit)

## Een vraag toevoegen of bewerken via /admin

1. Ga naar `https://<domein van de site>/admin` en klik op **Inloggen met GitHub**. De eerste keer vraagt GitHub of je de app toegang geeft; klik op **Authorize**.
2. Kies **Vragen**. Je ziet alle vragen, ook de concepten. Bovenaan kun je filteren op Nog niet op de site of Op de site.
3. Klik op een vraag om te bewerken, of op **Nieuwe Vraag** om er een toe te voegen.
4. Vul de velden in:
   - **Vraag**: zoals een ouder hem in de appgroep zou stellen.
   - **Adres (slug)**: laat leeg. Het adres wordt dan gemaakt van de vraag. Dit telt alleen bij een nieuwe vraag; daarna blijft het adres altijd hetzelfde, ook als je de vraag of dit veld later aanpast.
   - **Categorie** en **Eigenaar**: kies uit de lijst.
   - **Laatst gecheckt**: staat bij een nieuwe vraag op vandaag. Heb je een bestaand antwoord gecontroleerd, zet hier dan de datum van vandaag.
   - **Op de site**: *Nee, nog niet (concept)* is niet zichtbaar op de site. Zet op *Ja, zichtbaar op de site* als de commissie het antwoord heeft gecontroleerd. In het bestand heet dit veld `status`, met de waarden `concept` en `gepubliceerd`.
   - **Trefwoorden**: woorden die mensen gebruiken als ze zoeken, gescheiden door komma's.
   - **Gerelateerde vragen**: andere vragen die erbij horen. Ze komen onder het antwoord bij "Zie ook".
   - **Antwoord**: de tekst. Je kunt kopjes, lijstjes, vet en links gebruiken.
5. Klik op **Opslaan** (bovenaan). Je wijziging wordt direct opgeslagen in GitHub en Vercel bouwt de site opnieuw. Na een à twee minuten staat het online.

Is een antwoord ouder dan 12 maanden (volgens "Laatst gecheckt"), dan staat er een klein briefje op de pagina: "Dit antwoord is een tijd niet gecontroleerd." Pas de datum aan als je het hebt gecontroleerd.

Onder elke vraag staat een link "Klopt dit niet meer? Laat het weten". Die opent een mail aan de eigenaar van de vraag, met de vraag in het onderwerp.

**Een vraag verwijderen** kan ook via /admin, maar bedenk dat de link dan niet meer werkt voor wie hem al gedeeld heeft. Zet een verouderde vraag liever terug op Concept, of pas het antwoord aan.

## Drie regels voor een goed antwoord

1. **Eerst het antwoord, dan de uitleg.** De eerste zin geeft antwoord op de vraag. Wie alleen die zin leest, weet genoeg. Details, uitzonderingen en achtergrond komen daarna.
2. **Een vraag per pagina.** Gaat je tekst eigenlijk over twee vragen, maak er dan twee pagina's van en verwijs naar elkaar met "Gerelateerde vragen". Zo blijft elke link precies.
3. **Link naar de bron als het antwoord kan veranderen.** Bedragen, data, regels van de bond en tijden veranderen. Link naar de pagina op mhchbs.nl of knhb.nl waar het actuele antwoord staat, zodat de lezer kan controleren of het nog klopt.

Verder: schrijf zoals je praat ("je", geen ambtelijke taal) en noem geen namen van vrijwilligers; die wisselen. Noem de rol of de commissie.

## Iemand bewerkrechten geven

Een commissielid heeft een gratis GitHub-account nodig ([github.com/signup](https://github.com/signup)).

1. Ga naar [github.com/mhc-hbs/faq/settings/access](https://github.com/mhc-hbs/faq/settings/access) (Settings, Collaborators and teams). Hiervoor moet je eigenaar of beheerder van de organisatie zijn.
2. Klik op **Add people**, zoek de GitHub-gebruikersnaam en kies de rol **Write**.
3. Het commissielid krijgt een uitnodiging per mail en moet die accepteren. Daarna kan diegene inloggen op `/admin`.

Rechten intrekken doe je op dezelfde pagina met **Remove**.

Tip: met veel bewerkers is het handiger om in de organisatie een team te maken (bijvoorbeeld `faq-redactie`) met Write-rechten op deze repo, en mensen aan dat team toe te voegen.

## Een categorie of eigenaar toevoegen

Dat gaat niet via /admin, maar door een bestand aan te passen. Op GitHub kan dat in de browser: open het bestand, klik op het potloodje, pas aan en klik op **Commit changes**.

**Categorie**: voeg in [`src/content/categorieen.yaml`](src/content/categorieen.yaml) een blok toe:

```yaml
- slug: toernooien                  # wordt het adres: /toernooien
  naam: Toernooien
  omschrijving: Zomertoernooien, inschrijven en overnachten.
  volgorde: 8                       # plek op de voorpagina
```

**Eigenaar** (commissie): voeg in [`src/content/eigenaren.yaml`](src/content/eigenaren.yaml) een blok toe:

```yaml
- slug: toernooicommissie
  naam: Toernooicommissie
  email: toernooien@mhchbs.nl       # krijgt de "Klopt dit niet meer?"-mails
```

De keuzelijsten in /admin worden bij elke build uit deze twee bestanden gemaakt, dus na de volgende deploy staat de nieuwe categorie of eigenaar ook in het formulier.

Let op:

- De slug mag alleen kleine letters, cijfers en streepjes bevatten en moet uniek zijn.
- Verander of verwijder geen slug die al in gebruik is. Vragen die ernaar verwijzen laten de build dan mislukken (met een duidelijke foutmelding). Dat is expres: zo komt er nooit een kapotte pagina online.
- In `eigenaren.yaml` staan nu nog voorbeeldadressen (`@voorbeeld.invalid`). Vervang die door echte adressen voordat de site live gaat.

## Lokaal draaien

Je hebt [Node.js](https://nodejs.org) 22 of nieuwer nodig.

```sh
npm install
npm run dev              # http://localhost:4321
```

Zoeken werkt niet in `npm run dev`, omdat de zoekindex pas bij het bouwen wordt gemaakt. Wil je zoeken testen:

```sh
npm run build            # bouwt de site en de zoekindex naar dist/
npm run preview          # http://localhost:4321
```

**Concepten bekijken**: zet `PREVIEW=true` voor het commando. Conceptvragen worden dan ook gebouwd, met een gele balk "Concept".

```sh
PREVIEW=true npm run dev
```

**/admin lokaal gebruiken zonder GitHub-login**: start in een tweede terminal de lokale Decap-server. Wijzigingen worden dan direct in je lokale bestanden opgeslagen, niet op GitHub.

```sh
npx decap-server         # in terminal 1
npm run dev              # in terminal 2, open http://localhost:4321/admin
```

**Controleren**: `npm run check` controleert de code op typefouten. `npm run build` controleert ook alle vragen: een onbekende categorie, eigenaar of gerelateerde vraag laat de build mislukken.

## Uitrollen op Vercel

De site draait op Vercel, op het gratis **Hobby**-plan, onder een **account van de club** (niet onder een persoonlijk account). Zo blijft de site van de club als een vrijwilliger stopt. Zorg dat minstens twee bestuurs- of commissieleden toegang hebben tot dat Vercel-account.

Het Hobby-plan werkt hier omdat de repository openbaar is. Wordt de repo ooit privé, dan vraagt Vercel mogelijk om een betaald plan.

Eenmalig instellen:

1. Log in op [vercel.com](https://vercel.com) met het clubaccount en kies **Add New, Project**.
2. Geef Vercel toegang tot de GitHub-organisatie `mhc-hbs` (de Vercel GitHub-app installeren op de organisatie, met toegang tot de repo `faq`) en importeer `mhc-hbs/faq`.
3. Framework: Astro. Build command en output staan al in [`vercel.json`](vercel.json); laat de rest op de standaardwaarden.
4. Zet de [omgevingsvariabelen](#omgevingsvariabelen).
5. Klik op **Deploy**.
6. Koppel eventueel een eigen domein (bijvoorbeeld `vragen.mhchbs.nl`) via Settings, Domains. Pas daarna de callback-URL van de [OAuth App](#github-oauth-app-registreren) aan.

Daarna gaat alles vanzelf: elke wijziging op de branch `main` (ook opslaan in /admin) start een nieuwe deploy. Een build duurt ongeveer een minuut.

## Omgevingsvariabelen

Geheimen staan nooit in de repository, alleen in Vercel (Settings, Environment Variables).

| Naam | Waarde | Omgeving |
| --- | --- | --- |
| `OAUTH_GITHUB_CLIENT_ID` | Client ID van de GitHub OAuth App | Production |
| `OAUTH_GITHUB_CLIENT_SECRET` | Client secret van de GitHub OAuth App | Production |
| `PREVIEW` | `true` om conceptvragen ook te tonen | Alleen Preview, of lokaal |
| `SITE_URL` | Optioneel. Volledig adres van de site, bijvoorbeeld `https://vragen.mhchbs.nl`. Zonder deze variabele gebruikt de build het productiedomein van Vercel. | Production |

`SITE_URL` bepaalt de adressen in de linkvoorbeelden van WhatsApp. Zet hem zodra je een eigen domein gebruikt.

Na het wijzigen van een variabele moet je opnieuw deployen (Deployments, de laatste deploy, **Redeploy**).

## GitHub OAuth App registreren

Inloggen op /admin loopt via GitHub. Daarvoor is een OAuth App nodig. Registreer die **onder de organisatie `mhc-hbs`**, niet onder je eigen account, zodat hij blijft bestaan als jij stopt.

1. Ga naar [github.com/organizations/mhc-hbs/settings/applications](https://github.com/organizations/mhc-hbs/settings/applications) (organisatie, Settings, Developer settings, OAuth Apps). Je moet eigenaar van de organisatie zijn.
2. Klik op **New OAuth App** en vul in:
   - **Application name**: `Vragen MHC HBS beheer`
   - **Homepage URL**: `https://<domein van de site>`
   - **Authorization callback URL**: `https://<domein van de site>/api/callback`
3. Klik op **Register application**.
4. Kopieer de **Client ID** naar de Vercel-variabele `OAUTH_GITHUB_CLIENT_ID`.
5. Klik op **Generate a new client secret** en kopieer het geheim direct naar `OAUTH_GITHUB_CLIENT_SECRET`. GitHub laat het maar een keer zien.
6. Redeploy de site.

De callback-URL wijst naar de serverfunctie [`api/callback.ts`](api/callback.ts) op de site zelf. Verander je het domein, pas dan ook de callback-URL in de OAuth App aan. Inloggen werkt alleen op het domein dat daar staat, dus niet op preview-adressen van Vercel.

Het geheim kwijt of uitgelekt? Maak in de OAuth App een nieuw geheim aan, zet dat in Vercel, redeploy en verwijder het oude.

## Hoe het in elkaar zit

| Pad | Wat |
| --- | --- |
| `src/content/faq/<slug>.md` | Een vraag. De bestandsnaam is het adres. |
| `src/content/categorieen.yaml` | Lijst van categorieen. |
| `src/content/eigenaren.yaml` | Lijst van commissies met mailadres. |
| `src/content.config.ts` | Controle van de velden van elke vraag. Een typfout laat de build mislukken. |
| `src/pages/` | De pagina's: voorpagina, categorie, vraag, zoeken, 404. |
| `src/styles/global.css` | Alle opmaak. Clubkleuren staan bovenaan. |
| `decap/config.yml` | Instellingen van /admin. Dit bestand bewerk je. |
| `scripts/decap-config.mjs` | Maakt bij elke build `public/admin/config.yml` en vult de keuzelijsten. |
| `public/admin/index.html` | De beheerpagina (Decap CMS). |
| `api/auth.ts`, `api/callback.ts` | Inloggen met GitHub voor /admin. |

Een vraag ziet er zo uit:

```markdown
---
vraag: "Waar vind ik het wedstrijdschema?"
categorie: wedstrijden            # een slug uit categorieen.yaml
eigenaar: wedstrijdsecretariaat   # een slug uit eigenaren.yaml
laatst_gecheckt: 2026-10-12
status: gepubliceerd              # concept | gepubliceerd
trefwoorden: [schema, programma, wanneer spelen we]
gerelateerd: [hoe-werkt-het-dwf]  # optioneel, bestandsnamen van andere vragen
---
In de LISA-app. ...
```

Gebruikte techniek: [Astro](https://astro.build) (statische site), [Pagefind](https://pagefind.app) (zoeken, zonder server) en [Decap CMS](https://decapcms.org) (beheer). Zoeken maakt bij het bouwen een index; alleen gepubliceerde vragen komen erin.
