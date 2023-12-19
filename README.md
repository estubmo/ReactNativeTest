## Oppgave

Denne oppgaven kan løses på mange forskjellige metoder, og det er opp til deg hvordan du går frem og strukturerer oppgaven.
Men vi ønsker at du oppfyller noen av punktene under, og det er en Figma skisse du kan følge for guidelines. Men her er det rom for kreative endringer om ønskelig.

Du kan selve legge til de pakkene du selv ønsker og strukturere prosjektet som du selv ønsker. Det blir lagt vekt på utførelsen av kjerneoppgavene og bruk av riktige komponenter.

### Oppgaver

- Koden nå henter ut bare ett album, men start med å hente 10 stykker og list dem ut i en liste.
- Når en bruker trykker på et album i listen, så vises aktuelle i en modal

---

Bonusoppgaver

- Når bruker scroller til bunn av listen, så hent ut neste 10 stykker
- Når bruker er på toppen og drar ned, så refetcher man listen

#### Figma skisse

https://www.figma.com/file/jei4CDpTa1SjQof3mEHJ1q/Untitled?type=design&node-id=0%3A1&mode=design&t=2ptXlzK8J0OTR1Kb-1vs

#### GraphQL playground

https://graphqlzero.almansi.me/api


### Ting jeg ville forbedret om jeg brukte mer tid på oppgaven

- For å laste mer må man scrolle til bunn på FlatList. Det fungerer ikke om listen er for kort. Dette er løst med å ha et View som er høyt nok til at man må scrolle. Jeg ville heller lagt til en knapp som laster inn mer data.

- Splitte opp komponenten i egne filer.

- Expo Font var buggy, så jeg utelot å bruke det nå.

- Overlay er ikke over bildene.
