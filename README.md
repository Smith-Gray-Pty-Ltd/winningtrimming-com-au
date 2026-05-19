# Winning Trimming

[![WordPress](https://img.shields.io/badge/WordPress-6.7-blue.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-8.3-777bb4.svg)](https://php.net)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Hostinger](https://img.shields.io/badge/Hosting-Hostinger-673DE6.svg)](https://hostinger.com)

Marine, RV, and Trade upholstery & covers serving the **Hunter Region** — Lake Macquarie, Central Coast, Newcastle, Hunter Valley — NSW, Australia.

Docker + Traefik + Redis + MariaDB stack on Hostinger VPS.

---

## Quick Start Summary (5-Minute Local Deploy)

```bash
# 1. Clone
git clone git@github.com:Smith-Gray-Pty-Ltd/winningtrimming-com-au.git && cd winningtrimming-com-au

# 2. Configure
cp infra/.env.example infra/.env
# Edit infra/.env with your passwords (DB_ROOT_PASSWORD, DB_PASSWORD, REDIS_PASSWORD, ACME_EMAIL)

# 3. Launch
docker compose -f infra/docker-compose.yml up -d

# 4. Install WordPress at http://localhost:8080

# 5. Install plugins & activate theme
docker exec -it winningtrimming-wordpress wp plugin install rank-math-seo redirection wordfence wpforms-lite redis-cache --activate
docker exec -it winningtrimming-wordpress wp theme install astra --activate
docker exec -it winningtrimming-wordpress wp theme activate winningtrimming
```

---

## Structure

```
.
├── infra/
│   ├── docker-compose.yml   # Traefik labels, WordPress + MariaDB + Redis
│   ├── .env.example         # Copy to .env, fill in secrets (never commit .env)
│   └── htaccess             # Apache hardening + browser caching + redirects
├── wp-content/
│   ├── mu-plugins/          # Must-use plugins (auto-loaded)
│   │   ├── hardening.php    # Security hardening
│   │   ├── local-seo.php    # LocalBusiness JSON-LD schema
│   │   └── api-access.php   # REST API custom fields + health endpoint
│   ├── themes/
│   │   └── winningtrimming/ # Astra child theme (Projects CPT, Testimonials CPT)
│   └── plugins/             # Custom/premium plugins (via git or WP admin)
├── .gitignore
├── LICENSE
└── README.md
```

## Services

| Service | Container | Image | Healthcheck | Purpose |
|---|---|---|---|---|
| MariaDB | `winningtrimming-db` | `mariadb:${MARIADB_VERSION:-11}` | TCP + InnoDB | Database |
| Redis | `winningtrimming-redis` | `redis:${REDIS_VERSION:-7-alpine}` | PING | Object cache (256MB, allkeys-lru) |
| WordPress | `winningtrimming-wordpress` | `wordpress:${WORDPRESS_VERSION:-6.7-php8.3-apache}` | HTTP 200 | PHP/Apache + Traefik |

## Networks

| Network | Driver | Purpose |
|---|---|---|
| `internal` | bridge | Inter-service communication (db, redis, wordpress) |
| `traefik-public` | external | Connects to Traefik reverse proxy |

## Branches

| Branch | Environment |
|---|---|
| `main` | Production (winningtrimming.com.au) |
| `staging` | Staging (staging.winningtrimming.com.au) |
| `feature/*` | Dev work |

---

## Local Development (OrbStack)

### Prerequisites

- [OrbStack](https://orbstack.dev) installed on macOS
- Docker Compose
- Git

### 1. Clone & Configure

```bash
git clone git@github.com:Smith-Gray-Pty-Ltd/winningtrimming-com-au.git
cd winningtrimming-com-au
cp infra/.env.example infra/.env
```

Edit `infra/.env`:
```env
DB_ROOT_PASSWORD=secure_root_pw
DB_PASSWORD=secure_db_pw
ACME_EMAIL=dev@example.com
REDIS_PASSWORD=redis_pw
WP_ENVIRONMENT=local
WP_HOME=http://localhost:8080
WP_SITEURL=http://localhost:8080
WP_MEMORY_LIMIT=256M
```

### 2. Start Services

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Install WordPress

Visit `http://localhost:8080` and complete the install wizard.

### 4. Hot-Reload wp-content

Uncomment the bind mount volumes in `infra/docker-compose.yml` under `wordpress.volumes`:

```yaml
volumes:
  - wp_data:/var/www/html
  - ../wp-content/themes/winningtrimming:/var/www/html/wp-content/themes/winningtrimming
  - ../wp-content/mu-plugins:/var/www/html/wp-content/mu-plugins
  - ../wp-content/plugins:/var/www/html/wp-content/plugins
```

Then restart:
```bash
docker compose -f infra/docker-compose.yml up -d
```

---

## Production Deploy: Hostinger VPS

### 1. Create Traefik Network

```bash
docker network create traefik-public
```

### 2. Install Traefik

```bash
mkdir -p /docker/traefik && cd /docker/traefik
```

Create `docker-compose.yml`:
```yaml
services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - traefik-public

networks:
  traefik-public:
    external: true
```

```bash
docker compose up -d
```

### 3. Deploy WordPress Stack

```bash
mkdir -p /docker/winningtrimming && cd /docker/winningtrimming
git clone git@github.com:Smith-Gray-Pty-Ltd/winningtrimming-com-au.git .
cp infra/.env.example infra/.env
# Edit .env with production credentials
docker compose -f infra/docker-compose.yml up -d
```

### 4. Configure DNS

Point `winningtrimming.com.au` and `www.winningtrimming.com.au` A records to your VPS IP. Traefik auto-provisions Let's Encrypt SSL.

---

## Recommended Plugins

Install via WP Admin or WP-CLI after setup:

| Plugin | Purpose | Free/Premium |
|---|---|---|
| Astra (parent) | Lightweight, SEO-optimized theme | Free |
| Astra Pro | Advanced headers, blog layouts | Premium |
| RankMath SEO | Local SEO, schemas, sitemaps | Free + Premium |
| RankMath SEO PRO | Advanced schema, local SEO | Premium |
| Redirection | 301 redirect management | Free |
| WP Rocket | Page caching, CSS/JS minification | Premium |
| Redis Object Cache | Redis-backed object caching | Free |
| WPForms | Contact forms, booking inquiries | Free + Premium |
| Wordfence | Firewall + malware scan | Free + Premium |
| UpdraftPlus | Backups to remote storage | Free + Premium |
| Imagify | Image optimization/WebP | Freemium |

### One-Liner Plugin Install

```bash
docker exec -it winningtrimming-wordpress wp plugin install \
  rank-math-seo redirection wordfence wpforms-lite redis-cache updraftplus \
  --activate
docker exec -it winningtrimming-wordpress wp theme install astra --activate
docker exec -it winningtrimming-wordpress wp theme activate winningtrimming
```

---

## Mu-Plugins

Three mu-plugins ship with the repo, always active:

| File | Purpose |
|---|---|
| `hardening.php` | Login error obscuring, REST user enumeration blocked, WP version hidden, DISALLOW_FILE_EDIT, XML-RPC disabled |
| `local-seo.php` | LocalBusiness JSON-LD schema, geo meta tags for the Hunter Region |
| `api-access.php` | REST API custom fields for n8n (`featured_image_url`, `categories_names`, `tags_names`) + `GET /wt/v1/health` |

---

## Squarespace to WordPress Migration Guide

### Step 1: Audit Squarespace URLs

```bash
wget --spider --recursive --no-verbose https://winningtrimming.com.au/ 2>&1 | \
  grep "URL:" | awk '{print $3}' > squarespace-urls.txt
```

Or use [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/) (free up to 500 URLs).

### Step 2: Extract Content

1. **Pages**: Copy-paste from Squarespace. No automated export for page content.
2. **Images**: Download via browser dev tools or manual save.
3. **Blog Posts**: If any, try Settings > Advanced > Import/Export (Squarespace XML).
4. **Forms**: Note configurations; recreate in WPForms.

### Step 3: Recreate Pages

| Squarespace Page | WordPress Slug | Notes |
|---|---|---|
| Homepage | `/` | Hero + services overview + CTA |
| About | `/about` | Business history, team, Hunter Region |
| Marine Upholstery | `/marine-upholstery` | Service detail |
| RV Upholstery | `/rv-upholstery` | Service detail |
| Trade Covers | `/trade-covers` | Service detail |
| Projects/Portfolio | `/projects` | Archive for Project CPT |
| Contact | `/contact` | WPForms + Workshop Software link |
| Booking | `/booking` | Workshop Software booking link |

### Step 4: Configure Local SEO

1. Activate **RankMath SEO**.
2. Run setup wizard.
3. **RankMath > Titles & Meta > Local SEO**:
   - Business Name: Winning Trimming
   - Type: Local Business
   - Address: Lake Macquarie, NSW
   - Service Areas: Lake Macquarie, Central Coast, Newcastle, Hunter Valley
   - Phone + opening hours

The `local-seo.php` mu-plugin provides a LocalBusiness JSON-LD schema fallback.

### Step 5: 301 Redirects

**Using Redirection plugin (recommended):**
- Go to **Tools > Redirection**, add redirects individually or bulk-import CSV.

**Using .htaccess:**
```apache
# BEGIN Squarespace 301 Redirects
Redirect 301 /marine /marine-upholstery
Redirect 301 /rv-services /rv-upholstery
Redirect 301 /commercial /trade-covers
Redirect 301 /gallery /projects
Redirect 301 /enquire /contact
# END Squarespace 301 Redirects
```

> **Critical**: Test every redirect after DNS switch. Broken redirects immediately damage SEO.

### Step 6: Post-Migration Checklist

- [ ] Submit XML sitemap to Google Search Console (`/sitemap_index.xml`)
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify Google Business Profile is claimed and linked
- [ ] Test all forms (contact, booking)
- [ ] Test mobile responsiveness
- [ ] Run PageSpeed Insights (target 90+ mobile)
- [ ] Set up Google Analytics 4 (RankMath can inject the tag)
- [ ] Configure WP Rocket (page cache, CSS/JS minification, lazy loading)
- [ ] Enable Redis Object Cache plugin
- [ ] Set up UpdraftPlus automated backups (weekly to cloud)
- [ ] Configure Wordfence in "Learning Mode" for 1 week
- [ ] Test REST API endpoints for n8n integration

---

## Local SEO Best Practices (AU Service Business)

### On-Page

1. **Title tags**: `Service + Location` — e.g., `Marine Upholstery Lake Macquarie | Winning Trimming`
2. **H1**: One per page, include primary keyword.
3. **Meta descriptions**: 150-160 chars, location + CTA.
4. **Schema**: LocalBusiness JSON-LD via `local-seo.php` + RankMath. Verify with [Rich Results Test](https://search.google.com/test/rich-results).
5. **NAP consistency**: Business Name, Address, Phone identical across all platforms.
6. **Service area pages**: Dedicated pages per location:
   - `/marine-upholstery-newcastle`
   - `/rv-upholstery-central-coast`
   - `/trade-covers-hunter-valley`

### Off-Page

1. **Google Business Profile**: Optimized, weekly posts, review responses.
2. **AU directories**: True Local, Yellow Pages, Hotfrog, Yelp AU, Oneflare.
3. **Industry**: Marine industry associations, BIA (Boating Industry Association).
4. **Citations**: Local chamber of commerce, Lake Macquarie business directory.
5. **Reviews**: Automate post-service review requests via n8n.

### Technical

1. **Page speed**: Astra + WP Rocket + Redis + WebP.
2. **Mobile-first**: Astra is fully responsive.
3. **Sitemap**: RankMath auto-generates with all CPTs.
4. **SSL**: Traefik auto-provisions Let's Encrypt.
5. **Structured data**: LocalBusiness, Service, Review, FAQ via RankMath.

---

## n8n Integration

Works with the [n8n-smb-agent-template](https://github.com/Smith-Gray-Pty-Ltd/n8n-smb-agent-template) for automated content, SEO, and social media.

### Setup: Application Password

1. **Users > Profile** in WordPress Admin.
2. Scroll to **Application Passwords**.
3. Create a new password named `n8n-integration`.
4. Copy the generated password.

### n8n HTTP Request Node Config

**Base URL**: `https://winningtrimming.com.au/wp-json`

**Headers**:
```
Authorization: Basic base64(username:application_password)
Content-Type: application/json
```

### Key Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/wp/v2/posts` | List posts |
| POST | `/wp/v2/posts` | Create post |
| GET | `/wp/v2/posts?categories=X` | Posts by category |
| POST | `/wp/v2/media` | Upload image |
| GET | `/wp/v2/project` | List projects |
| POST | `/wp/v2/project` | Create project |
| GET | `/wp/v2/categories` | List categories |
| GET | `/wp/v2/tags` | List tags |
| GET | `/wt/v1/health` | Health check |

### Example: Create a Blog Post

```json
POST /wp-json/wp/v2/posts
{
  "title": "How to Care for Marine Upholstery in the Hunter Region",
  "content": "<p>Full article HTML...</p>",
  "status": "draft",
  "categories": [4],
  "tags": [7, 12],
  "featured_media": 123
}
```

### n8n Workflow Ideas

1. **Auto-blog from Google Business Profile**: GBP posts → WordPress drafts.
2. **Project showcase**: Publish project CPT → auto-post to GBP and social media.
3. **Review monitoring**: Weekly Google reviews → "Recent Reviews" post.
4. **Seasonal content**: "Summer boat prep in Lake Macquarie" on schedule.
5. **Location pages**: Generate from Google Sheets data source.

### Custom REST Fields

The `api-access.php` mu-plugin adds to all post responses:
- `featured_image_url` — Full-size featured image URL
- `categories_names` — Array of category names
- `tags_names` — Array of tag names

---

## Docker Management Commands

```bash
# Start
docker compose -f infra/docker-compose.yml up -d

# Logs
docker compose -f infra/docker-compose.yml logs -f wordpress

# Restart
docker compose -f infra/docker-compose.yml restart wordpress

# Stop
docker compose -f infra/docker-compose.yml down

# Shell into container
docker exec -it winningtrimming-wordpress bash

# WP-CLI
docker exec -it winningtrimming-wordpress wp plugin list
docker exec -it winningtrimming-wordpress wp cache flush
docker exec -it winningtrimming-wordpress wp rewrite flush

# DB backup
docker exec winningtrimming-db mysqldump -u root -p"$DB_ROOT_PASSWORD" wordpress \
  > backup-$(date +%Y%m%d).sql

# DB restore
docker exec -i winningtrimming-db mysql -u root -p"$DB_ROOT_PASSWORD" wordpress \
  < backup.sql

# Redis CLI
docker exec -it winningtrimming-redis redis-cli -a "$REDIS_PASSWORD"
```

---

## Security Hardening Summary

| Layer | Measure |
|---|---|
| Traefik | TLS 1.2+, HSTS (preload), CSP, XSS filter, frame options, permissions policy |
| .htaccess | XML-RPC blocked, author enumeration blocked, wp-cron external access blocked |
| WordPress | DISALLOW_FILE_EDIT, WP version hidden, REST user endpoints removed, login errors obscured |
| Docker | Internal network isolation, healthchecks, secrets via env vars |
| Plugins | Wordfence firewall + malware scanning |

---

## Changelog

### v1.0.0 (2025-05-19)

- Initial repository structure
- Docker Compose stack: WordPress, MariaDB, Redis with healthchecks
- Traefik reverse proxy with TLS, www redirect, security headers
- Mu-plugins: security hardening, local SEO schema, API access for n8n
- Astra child theme with Projects + Testimonials CPTs + Service Categories taxonomy
- .htaccess with caching directives and redirect placeholder
- Comprehensive README: migration guide, SEO playbook, n8n integration, deploy docs

---

## License

MIT — see [LICENSE](./LICENSE).

---

## CI/CD (Future)

Recommended pipeline for Hostinger VPS:

1. Push to `main` branch.
2. GitHub Actions SSH into VPS.
3. `git pull` in `/docker/winningtrimming`.
4. `docker compose -f infra/docker-compose.yml up -d`.
5. `wp cache flush` via WP-CLI.
