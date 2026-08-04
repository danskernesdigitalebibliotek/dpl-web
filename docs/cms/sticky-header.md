# Sticky-headeren (hvorfor den blev slået fra, og hvordan den er genoplivet)

Sidens header er *bygget* til at være en sticky "skjul ved scroll-ned / vis ved
scroll-op"-header. Den adfærd blev i april 2024 **slået fra i stilhed** — ikke
ved at koden blev fjernet, men som en bivirkning af en `overflow` på sidens
layout-wrapper. Denne branch genopliver den. Dokumentet forklarer hvorfor
sticky-header-koden findes, hvor den bor, hvor den aktiveres, hvorfor den blev
blokeret, hvornår det skete, og hvordan blokeringen er løst — så den næste der
falder over koden ikke antager at det er død ballast og sletter den.

## Hvor koden bor, og hvor den aktiveres

Selve adfærden ligger i **design-system** (kilden), men bliver først levende når
den bygges og indlejres i **CMS'ens** Novel-tema. Kæden er:

### 1. Kilden (design-system)

| Fil | Ansvar |
|-----|--------|
| `design-system/src/stories/Blocks/header/header.scss` (linje 9) | Sætter `position: sticky` og `z-index: 200` på `.header`. |
| `design-system/src/stories/Blocks/header/header-sticky.js` | Lytter på `scroll` og styrer `header.style.top`: ned → `-{headerHeight}px` (headeren glider op og ud), op → `0` (headeren glider ind igen). |

I Storybook — hvor headeren ikke er pakket ind i noget — **virker** den. Det er
derfor fejlen aldrig blev opdaget i design-system.

### 2. Build → CMS

`header.scss` kompileres ind i `design-system/build/css/base.css`, og
JS-filerne kopieres til `design-system/build/js/`. Herfra kopieres begge dele
ind i temaet med:

```
task dev:cms:link:design-system
```

som lægger dem i `cms/web/themes/custom/novel/assets/dpl-design-system/`
(`css/base.css` + `js/header-sticky.js`). Disse assets er **build-artefakter**
og er git-ignored — kilden er altid i design-system.

### 3. Aktivering (Novel-temaet)

CSS'en indlæses via `base`-biblioteket, og JS'en via `header`-biblioteket i
`cms/web/themes/custom/novel/novel.libraries.yml`:

```yaml
base:
  css:
    theme:
      assets/dpl-design-system/css/base.css: {}   # ← .header { position: sticky } bor heri
      css/novel.css: {}

header:
  js:
    assets/dpl-design-system/js/header-sticky.js: {}   # ← scroll-adfærden
    assets/dpl-design-system/js/header-state.js: {}
    assets/dpl-design-system/js/header-sidebar-nav-js.js: {}
```

`base` er globalt vedhæftet via `novel.info.yml` (`libraries:`), mens
`header`-biblioteket vedhæftes eksplicit øverst i header-templaten:

```twig
{# cms/web/themes/custom/novel/templates/layout/header.html.twig, linje 1 #}
{{ attach_library('novel/header') }}
```

Så koden **er** både indlæst og kørende på hver side. Selv mens headeren var
blokeret, satte `header-sticky.js` stadig `header.style.top` mens man scroller —
det var bare uden visuel effekt, af grunden nedenfor.

## Hvorfor den blev slået fra på det rigtige site

I CMS'en pakkes hele siden ind af Novel-temaet. Frem til denne branch var
wrapperen:

```twig
{# cms/web/themes/custom/novel/templates/layout/page.html.twig #}
<div class="overflow-hidden">   {# ← blokeringen #}
  {{ include('@novel/layout/header.html.twig', …) }}
  …
  <main id="main-content">{{ page.content }}</main>
</div>
```

`.overflow-hidden` (`overflow: hidden`, fra
`design-system/src/styles/scss/shared.scss`) gør den wrapper til en
**scroll-container**. Ifølge CSS-specifikationen klæber `position: sticky` til
sin nærmeste scroll-container-ancestor — så headeren klæber ikke længere til
**viewporten**, men "klæber" inde i en container der selv er lige så høj som
hele siden og scroller væk sammen med den. Nettoresultat: headeren scroller væk
som statisk indhold. `header-sticky.js` kørte stadig og satte stadig `top`,
men det havde ingen synlig effekt.

Grunden til at det gik ubemærket hen er at de to halvdele bor i **forskellige
projekter**: design-system leverer og previewer headeren (hvor sticky virker),
og CMS-temaet er dét der pakker siden ind (hvor den brydes). Ingen der kigger
på headeren i Storybook ville nogensinde se den knække.

## Hvornår vi "ødelagde" det

| Dato | Commit | Hvad skete |
|------|--------|------------|
| 2023-08-31 | `2cc5c4642` "Adding sticky header js and styling" | Sticky header indført. **Den virkede.** |
| 2024-04-08 | `5493c83b0` "Make header-sticky.js more specific…" | Header-JS'en finjusteret — samme forfatter, samme minut som ændringen nedenfor. |
| 2024-04-08 | `ce413cd1e` "Make sure header doesnt break out zoom on mobile. **DDFFORM-517**" | Wrapper ændret fra `<div>` til `<div class="overflow-hidden">` for at stoppe headeren i at bryde ud horisontalt ved udzoom på mobil. **Dette slog i stilhed sticky-headeren fra.** |
| 2024-04-09 | `8bcfab2be` | DDFFORM-517 rullet tilbage… |
| 2024-04-19 | `313467f3c` | …derefter genindført. Blokeringen har været der lige siden. |

Sticky-headeren virkede altså i cirka **otte måneder** (aug. 2023 → apr. 2024)
og har ligget i dvale siden. Blokeringen var **kollateral skade fra et
mobil-zoom-fix (DDFFORM-517)**, ikke en bevidst beslutning om at droppe
sticky-headeren — den commit der tilføjede `overflow-hidden` var minutter
forinden i gang med at finpudse sticky-header-JS'en, hvilket stærkt antyder at
forfatteren ikke opdagede at de to var i konflikt.

## Fixet: `overflow-x: clip` i stedet for `overflow: hidden`

Denne branch skifter wrapperen fra `overflow: hidden` til **`overflow-x: clip`**
(via en ny `.overflow-x-clip`-utility i design-system's `shared.scss`) i både
`page.html.twig` og `page--node--preview.html.twig`:

- `overflow-x: clip` klipper stadig det horisontale breakout som DDFFORM-517
  handlede om, så det oprindelige mobil-zoom-fix består — der er ingen regression
  på dét punkt.
- Men `overflow-x: clip` lader `overflow-y` forblive `visible` og skaber derfor
  **ikke** en scroll-container. Dermed klæber `position: sticky` igen til
  viewporten, og headeren virker som før april 2024.

Vigtigt at forstå: at løsne wrapperen genaktiverer sticky for **alle**
efterkommere, ikke kun headeren. Man kan ikke selektivt genaktivere sticky for
ét undertræ via en ancestors `overflow`; det er alt-eller-intet. Fixet er derfor
et bevidst valg om at bringe den oprindelige, tilsigtede sticky-adfærd tilbage
for hele siden.

## Nuværende tilstand (denne branch: sticky-headeren er genoplivet)

Med `overflow-x: clip` på plads **er headeren sticky igen** og gør nu det dens
JS altid var bygget til:

- scroll ned → headeren glider op og ud af vejen (`top: -{headerHeight}px`),
- scroll op → headeren glider ind og pinner i toppen (`top: 0`).

Hvis den genoplivede header en dag *ikke* er ønsket, er alternativerne:

1. **Neutralisér headerens sticky i Novel-temaet** (fx override
   `.header { position: static }`), så den scroller væk som før 2024-04-08,
   uden at røre wrapperen.
2. **Rul wrapperen tilbage** til `overflow: hidden`; så går headeren i dvale
   igen (og enhver anden `position: sticky` på siden holder op med at klæbe).

## Sådan verificerer du blokeringen (eller fixet)

Åbn en vilkårlig side, scroll ned og op igen, og inspicér headeren:

```js
const el = document.querySelector('.header');
getComputedStyle(el).position;                    // "sticky"
el.getBoundingClientRect().top;                   // klæbet → 0; brudt → negativ
el.closest('.overflow-hidden, .overflow-x-clip'); // hvilken wrapper er i spil
```

`top === 0` når man scroller op betyder at sticky er levende; en negativ værdi
(og en `.overflow-hidden`-wrapper) betyder at en klippende ancestor stadig
sluger den.
