# Officina Agricola Ghisotti Emanuele – sito web

Sito statico di [www.officinaghisotti.it](https://www.officinaghisotti.it), pubblicato su **Netlify**.
Ogni modifica salvata sul ramo `main` di questo repository viene pubblicata automaticamente in circa un minuto.

## Struttura

| Percorso | Contenuto |
|---|---|
| `index.html` | Home in italiano |
| `en/index.html` | Home in inglese |
| `fr/index.html` | Home in francese |
| `privacy-policy/`, `cookie-policy/` | Documenti legali |
| `grazie/`, `en/thank-you/`, `fr/merci/` | Pagine di conferma dopo l'invio del modulo |
| `404.html` | Pagina "non trovata" |
| `assets/css/` | `site.css` (home) e `legal.css` (pagine di servizio) |
| `assets/js/site.js` | Menu mobile e animazioni di comparsa (nessun cookie) |
| `assets/img/` | Logo, foto prodotti, miniature video, icone |
| `assets/fonts/` | Archivo e IBM Plex Mono, ospitati in locale (licenza OFL) |
| `netlify.toml` | Redirect dal vecchio sito Wix, intestazioni di sicurezza e cache |
| `sitemap.xml`, `robots.txt` | Indicizzazione |

Non c'è alcun passaggio di build: i file vengono pubblicati così come sono.

## Modulo preventivo

Il modulo nelle tre home usa **Netlify Forms** (`name="preventivo"`). Le richieste compaiono in Netlify
nella sezione *Forms*; per riceverle via e-mail: *Project configuration → Notifications → Emails and webhooks →
Form submission notifications* con l'indirizzo `ghisotti.officina@gmail.com`.

## Statistiche

Nessun cookie e nessuno script di tracciamento: le visite si consultano dal pannello Netlify (statistiche
calcolate dai registri del server). Per questo il sito non ha bisogno del banner cookie.

## Pubblicare una modifica

1. Modificare i file (oppure chiederlo a Claude).
2. Fare commit e push su `main`.
3. Netlify pubblica automaticamente; ogni versione resta disponibile in *Deploys* per un eventuale ripristino.

Quando si cambia un testo in una lingua, ricordarsi di aggiornare anche le altre due versioni.
