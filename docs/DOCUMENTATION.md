# Casements (A) Ltd — Website & CRM Documentation

**Version 1.0 · August 2026**
Complete reference for the public website, the admin/CRM system, roles, forms, SEO and operations.

---

## 1. Overview

A single Next.js application serves two things:

| Part | Path | Audience |
|---|---|---|
| **Public marketing website** | `/` and all public pages | Customers, search engines |
| **Admin / CRM** | `/crm` | Casements staff (login required) |

Everything the team manages — leads, products, projects, blog posts, page content, media, staff — lives in one PostgreSQL database and is edited through the CRM. **No code changes are needed for day-to-day content updates.**

### Technology

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon, eu-central-1) via Prisma ORM |
| Authentication | NextAuth.js (credentials) |
| File storage | Vercel Blob (private store + public proxy) |
| Hosting | Vercel (auto-deploys from GitHub `main`) |
| Analytics | Self-hosted page-view tracking + Google Tag Manager |

### Environments

| | URL |
|---|---|
| **Production** | `https://casements-website.vercel.app` |
| **Admin login** | `https://casements-website.vercel.app/crm/login` |
| **Local dev** | `http://localhost:3300` (`npm run dev`) |
| **Repository** | `github.com/dlomaxw/casements` |
| **Target domain** | `casements.co.ug` *(not yet pointed — see §14)* |

### Brand

- **Green** `#1f7a3d` (primary) · **Yellow** `#f5b800` (accent) · **Near-black** `#101010`
- **DM Sans** for headings, **Inter** for body text
- Logo: `/images/casements-logo-lockup.png` (full), `/images/casements-mark.png` (symbol)

---

## 2. Public website structure

| Page | Path | Content source |
|---|---|---|
| Home | `/` | CMS content + database (products, projects, blog) |
| About Us | `/about-us` | CMS content + projects from database |
| Products index | `/products` | Database (Product) |
| Product detail | `/products/[slug]` | Database — one page per product |
| Projects | `/projects` | Database (ProjectItem) — 29 live |
| Blog index | `/blog` | Database (Post) |
| Blog post | `/blog/[slug]` | Database — one page per post |
| CSR | `/csr` | CMS content |
| Testimonials | `/testimonials` | CMS content |
| Contact | `/contact` | CMS content + embedded map |

**Navigation:** Home · About Us · Products (dropdown of all live products) · Projects · CSR · Blog · Contact, plus the phone number and a **Get a Quote** button.

### Home page sections (in order)

1. **Hero** — two-line headline (second line green), subtitle, background + showcase image, trust badge, two CTAs
2. **Stats strip** — 4 editable statistics (years, ISO, projects, materials)
3. **Services strip** — Technical Guidance · Fabrication · Installation
4. **Product highlights** — Aluminium / Glass / Steel
5. **Why Casements** — 3 editable pillars with icons
6. **Video showcase** — 3 YouTube videos (click-to-play)
7. **Your Vision, Our Process** — 4 steps
8. **Featured projects** — pulled live from the projects database
9. **Consultation CTA**
10. **Testimonials**
11. **Blog preview** — latest 3 posts
12. **Contact form**

### Always-on elements

| Element | Position | Function |
|---|---|---|
| **WhatsApp button** | Bottom **right** | Opens WhatsApp chat |
| **Chat assistant** | Bottom **left** | Answers product/project/quote/contact questions, hands off to the quote form |
| **Quote modal** | Header button | Submits directly into the CRM |

---

## 3. Admin / CRM structure

Login at `/crm/login`. What appears depends on the user's role (§4).

| Section | Path | Purpose |
|---|---|---|
| **Dashboard** | `/crm` | Role-aware overview, quick actions, traffic snapshot, lead pipeline |
| **Analytics** | `/crm/analytics` | Website visits and most-viewed pages |
| **Leads** | `/crm/leads` | Sales pipeline (search, filter, paginate) |
| **Lead detail** | `/crm/leads/[id]` | Status, notes, follow-up, activity log, reassignment |
| **Products** | `/crm/products` | Full product catalogue management |
| **Projects** | `/crm/projects` | Portfolio management |
| **Content** | `/crm/content` | Website text and images |
| **Blog** | `/crm/blog` | Blog post management |
| **Media** | `/crm/media` | Image library |
| **Staff** | `/crm/users` | Team accounts and permissions |
| **Settings** | `/crm/settings` | Own profile, password, notifications |

A **Quotation System** button in the leads sidebar links to the external quotation tool.

---

## 4. Roles and permissions

Five roles, each granting a set of capabilities.

| Capability | Admin | Manager | Developer | Marketing | Sales Rep |
|---|:--:|:--:|:--:|:--:|:--:|
| Full administration | ✅ | — | — | — | — |
| Manage staff accounts | ✅ | ✅ | — | — | — |
| Manage website content | ✅ | ✅ | ✅ | ✅ | — |
| Manage blog posts | ✅ | ✅ | ✅ | ✅ | — |
| Manage media / uploads | ✅ | ✅ | ✅ | ✅ | — |
| View analytics | ✅ | ✅ | ✅ | ✅ | — |
| View leads | ✅ | ✅ | — | — | ✅ (own only) |
| Assign / reassign leads | ✅ | ✅ | — | — | — |

### How the rules behave

- **Sales Reps see only their own leads** — enforced on every page *and* every API endpoint, not just hidden in the interface.
- **Admins and Managers see all leads** and can reassign them to any active team member.
- **Managers cannot create Admins or other Managers** — they may only create Developer, Marketing and Sales Rep accounts.
- **An admin cannot deactivate or demote their own account** (prevents lock-out).
- Product/Project/Content/Blog management is grouped under one capability, so Developers and Marketing can maintain the whole website without touching sales data.

### Adding a staff member

**Staff → Add staff member** → name, email, password (min 8 characters), role, optional WhatsApp number. For Sales Reps you can also assign **product categories**, which routes matching enquiries to them automatically.

Admins can also reset any password, deactivate/reactivate accounts, and change category assignments. Each user changes their own password under **Settings**.

---

## 5. Website content management (CMS)

**CRM → Content.** Around 78 editable blocks, grouped into collapsible sections per page. Each field has a built-in default; saving an override publishes it immediately.

| Section | What you can edit |
|---|---|
| **Global** | Phone (3 numbers), toll-free, email, address, opening hours, top ribbon |
| **Home** (42 fields) | Hero (headline, subtitle, both images, badge), 4 statistics, Why-Casements pillars, video section + 3 video links and captions, section headings, contact block |
| **About** | Eyebrow, heading, mission statement, background image |
| **Products / Projects / Testimonials / Contact / CSR** | Page headings, subtitles, CSR pillars, testimonial reviews |

Text fields, multi-line fields and **image fields** (upload or paste a URL) are supported. A sticky save bar shows the unsaved-change count.

> Global contact details feed the header, footer, contact page, CTAs, chat assistant and search-engine data — change the phone number once and it updates everywhere.

---

## 6. Products

**CRM → Products.** Each product is a database record generating its own page, catalogue card, navigation entry and quote-form category.

### Fields

| Field | Purpose |
|---|---|
| Title / Short title | Full name; short name for navigation |
| **Product type** | Aluminium, Glass, Steel, Wood, Ceiling, Curtain Wall, Facade, Partitions, Railings, Interior Design, Other — shown as a badge |
| Description | Catalogue card text |
| Overview | Detail-page body |
| Main image | Catalogue and hero image |
| **Gallery** | Multiple images, each with a caption |
| **Features** | "What we offer" bullet list |
| **Video link** | YouTube/Vimeo — embedded on the page |
| **Brochure link** | PDF/Drive link → "Download Brochure" button |
| **FAQs** | Question/answer pairs — displayed *and* sent to Google as rich-results data |
| Keywords | SEO keywords |
| Publish / draft | Controls visibility |

### Gallery behaviour

Captions display under each image with an icon. Clicking opens a **lightbox** with previous/next arrows, keyboard control (← → and Esc) and an image counter. Cards animate on hover.

### Current state

9 products live. Galleries: Aluminium (14 images), Ceiling (10), Curtain Wall (10), Partitions (6). Facade, Glass, Interiors, Railings and Steel await photography. Brochures are attached to the first 7 products.

---

## 7. Projects

**CRM → Projects.** 29 real projects, each with name, location, completion date, scope of works, image, and draft/publish status.

Projects appear on `/projects` and in the **Featured Projects** section of the home page. Ordering is controlled by the `order` field.

---

## 8. Blog

**CRM → Blog.** Posts support a title, excerpt, body, category, **cover image** (upload or URL), **video link**, and draft/publish status. Slugs are generated automatically and kept unique.

Published posts appear on `/blog`, get their own page at `/blog/[slug]`, feed the home-page preview, and are added to the sitemap automatically.

---

## 9. Media library

**CRM → Media.** Upload images and copy their URLs for use anywhere.

**How storage works:** the connected Vercel Blob store is *private*, so uploads are stored privately and served through a public proxy at `/api/media/[...path]` with one-year immutable caching. Uploaded files therefore have URLs like `/api/media/casements/…`. Pasting an external image URL works everywhere as an alternative.

---

## 10. Forms and lead capture

**Every form submission creates a CRM lead.** Nothing depends on email being configured.

| Form | Where | Fields | Creates |
|---|---|---|---|
| **Quote modal** | Header "Get a Quote", chat assistant | Name, phone, email, product, project size, message | Lead |
| **Quote form** | Every product page | Same, product pre-filled | Lead |
| **Contact form** | Home page, Contact page | Name, email, message | Lead (category *general-enquiry*) |
| **Register interest** | Home page modal | Name, phone, email | Lead |

### What happens on submission

1. Input is validated (server-side, with rate limiting — max 5 requests/minute per IP)
2. A lead is created in the database
3. The lead is **auto-assigned** to the sales rep mapped to that product category (falling back to the default rep)
4. The assignment is recorded in the lead's activity log
5. An email notification is prepared for the rep *(inactive until an email key is added — see §15)*
6. A WhatsApp alert is prepared for large/commercial projects *(inactive until credentials are added)*

### Lead pipeline

`NEW → CONTACTED → SITE_ASSESSED → QUOTED → WON / LOST`

Each lead holds contact details, product, project size, timeline, message, source page, assigned rep, follow-up date, notes and a full activity log. A daily cron job (06:00 UTC) emails reps a digest of overdue follow-ups.

---

## 11. Analytics

**CRM → Analytics**, with a summary on the dashboard.

| Metric | Detail |
|---|---|
| Daily / Weekly / Monthly | Views and unique visitors |
| 30-day trend | Bar chart, hover for daily figures |
| Most visited pages | Ranked, with views, visitors and magnitude bars |
| Traffic sources | Referring sites |
| Devices | Mobile vs desktop |

**Privacy by design:** no IP addresses are stored. Visitors are counted with an anonymous daily-rotating hash, so repeat views deduplicate without holding personal data. **Bots are filtered out and `/crm` is never tracked.**

Google Tag Manager (`GTM-KR7G24KQ`) is also installed site-wide for marketing tags.

---

## 12. SEO

| Feature | Status |
|---|---|
| **Dynamic sitemap** (`/sitemap.xml`) | Generated live from the database — new products and posts appear immediately |
| **robots.txt** | Allows the public site; blocks `/crm` and `/api` |
| **Google Search Console** | Verification tag installed |
| **Canonical URLs** | On all product and blog pages |
| **Open Graph / Twitter cards** | Titles, descriptions and images |
| **Structured data (JSON-LD)** | Organization, LocalBusiness, WebSite (site-wide); Service + Breadcrumbs (products); BlogPosting + Breadcrumbs (posts); FAQPage (products with FAQs) |
| **Performance** | Images optimized and lazy-loaded; videos load only on click |

All URLs derive from one setting (`NEXT_PUBLIC_SITE_URL`) — changing it when the real domain goes live updates the sitemap, canonicals, robots and structured data together.

> **Note on rankings:** no provider can guarantee a number-one position. The realistic objective is first-page visibility and top-three placement for high-value Uganda searches, achieved through strong per-product pages, genuine project case studies and FAQs — not mass-produced near-identical location pages, which search engines penalise.

---

## 13. Database schema

| Model | Purpose |
|---|---|
| **Lead** | Enquiries from every form, with pipeline status and assignment |
| **Activity** | Audit trail per lead (status changes, notes, assignments) |
| **User** | Staff accounts: role, active flag, notification preferences, job title |
| **RepProductMap** | Maps a product category to the sales rep who receives its leads |
| **Product** | Catalogue: images, gallery, features, FAQs, video, brochure, type |
| **ProjectItem** | Portfolio entries |
| **Post** | Blog posts |
| **Media** | Uploaded files |
| **SiteContent** | Key/value overrides for editable website text and images |
| **PageView** | Anonymous analytics events |

**Enums:** `LeadStatus`, `ProjectSize`, `Role`, `PostStatus`.

### Live data (August 2026)

3 staff accounts · 9 products · 29 projects · 3 blog posts · 6 leads · 119 page views

---

## 14. Deployment and operations

### Automatic deployment

Every push to `main` on GitHub triggers a Vercel production build. Manual deploy: `vercel deploy --prod`.

### Common commands

```bash
npm run dev            # local dev server on port 3300
npm run build          # production build
npx prisma db push     # apply schema changes to the database
npx prisma studio      # visual database browser
```

> **Important:** never run `npm run build` while the dev server is running — both write to the same `.next` folder and the dev server will start returning broken assets. If that happens, delete `.next` and restart.

### Going live on `casements.co.ug`

1. Add the domain in the Vercel project settings
2. Point DNS at Vercel at the `.ug` registrar
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the real domain
4. Re-verify in Google Search Console and submit the sitemap

Until this is done, search engines index the `.vercel.app` address.

### Environment variables (names only — values live in Vercel)

`DATABASE_URL` · `NEXTAUTH_URL` · `NEXTAUTH_SECRET` · `NEXT_PUBLIC_SITE_URL` · `CRM_API_KEY` · `CRM_DEFAULT_REP_ID` · `CRON_SECRET` · `EMAIL_FROM` · `EMAIL_SALES` · `EMAIL_GM` · `BLOB_STORE_ID` · plus Neon/Postgres connection variables.

Not yet set: `RESEND_API_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `NEXT_PUBLIC_GA_ID`.

### Maintenance

| Frequency | Task |
|---|---|
| Daily (automatic) | Follow-up reminder emails to reps |
| Weekly | Review analytics and lead conversion |
| Monthly | Update dependencies; review search performance |
| Quarterly | Refresh product images and project portfolio |

---

## 15. Outstanding items

| Item | Impact | Action |
|---|---|---|
| **Domain not pointed** | High — SEO indexes the wrong address | Point `casements.co.ug` at Vercel |
| **Email not configured** | Staff must log in to see new leads | Add a Resend API key |
| **WhatsApp alerts inactive** | No instant alert for large enquiries | Add Meta WhatsApp credentials |
| **Default passwords** | Security | Change both seeded passwords |
| **Placeholder testimonials** | Credibility + blocks review markup | Replace with genuine client reviews |
| **Blog images show old contact details** | Brand consistency | Re-export with current Casements details |
| **5 products lack photography** | Presentation | Supply images for Facade, Glass, Interiors, Railings, Steel |
| **Brochure mapping unverified** | Wrong PDF may be attached | Confirm in Products; Railings and Steel have none |

---

## 16. Access

| Account | Role | Notes |
|---|---|---|
| `gm@casements.co.ug` | Administrator | Full access |
| `sales@casements.co.ug` | Sales Rep | Default lead recipient |
| `samtech@casements.co.ug` | Developer | Website content and media |

Passwords are held separately — **the two seeded accounts still use their default password and should be changed.** Database and API secrets live in the Vercel project settings, never in the repository.

---

*Maintained by the development team. Update whenever routes, roles or features change.*
