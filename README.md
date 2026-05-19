# Winning Trimming

[![WordPress](https://img.shields.io/badge/WordPress-6.7-blue.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-8.3-777bb4.svg)](https://php.net)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Hostinger](https://img.shields.io/badge/Hosting-Hostinger-673DE6.svg)](https://hostinger.com)

Marine, RV, and Trade upholstery & covers serving the **Hunter Region** — Lake Macquarie, Central Coast, Newcastle, Hunter Valley — NSW, Australia.

Docker + Traefik + Redis + MariaDB stack on Hostinger VPS.

> **Project name**: `winningtrimming` — set via `COMPOSE_PROJECT_NAME` in `.env`. All Docker volumes and networks use this prefix (e.g. `winningtrimming_wp_data`, `winningtrimming_internal`).

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

# 5. Install plugins (Wordfence is installed but NOT activated — see Known Issues below)
docker run --rm --network winningtrimming_internal --user 33:33 \
  -e WORDPRESS_DB_HOST=winningtrimming-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wt_local_db_pw_2025 \
  -e WORDPRESS_DB_NAME=wordpress \
  -v winningtrimming_wp_data:/var/www/html \
  wordpress:cli plugin install seo-by-rank-math redirection wpforms-lite redis-cache --activate

docker run --rm --network winningtrimming_internal --user 33:33 \
  -e WORDPRESS_DB_HOST=winningtrimming-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wt_local_db_pw_2025 \
  -e WORDPRESS_DB_NAME=wordpress \
  -v winningtrimming_wp_data:/var/www/html \
  wordpress:cli theme install astra --activate

# 6. Copy theme files from repo into container
docker cp wp-content/themes/winningtrimming winningtrimming-wordpress:/var/www/html/wp-content/themes/winningtrimming
docker exec winningtrimming-wordpress chown -R www-data:www-data /var/www/html/wp-content/themes/winningtrimming
```

---

## Local Dev Credentials

When the stack is running locally, here's what you need:

| | Value |
|---|---|
| **Site URL** | `http://localhost:8080` |
| **Admin URL** | `http://localhost:8080/wp-admin` |
| **Username** | `admin` |
| **Password** | `wt_local_admin_2025` |
| **DB Host** | `winningtrimming-db` (from inside containers) |
| **DB User/Pass** | `wordpress` / `wt_local_db_pw_2025` |
| **Redis Host** | `winningtrimming-redis` (from inside containers) |
| **Redis Pass** | `wt_local_redis_pw_2025` |

---

## Current State

These are already set up in the local environment as of the last deploy:

- **7 pages created**: Home (`/`), About (`/about`), Marine Upholstery (`/marine-upholstery`), RV Upholstery (`/rv-upholstery`), Trade Covers (`/trade-covers`), Contact (`/contact`), Book a Call (`/booking`) — all with Gutenberg block content matching the original Squarespace site structure.
- **Navigation menu**: Home, About, Marine Upholstery, RV Upholstery, Trade Covers, Contact — assigned to primary location.
- **Theme**: Winning Trimming (Astra child) — active.
- **Plugins active**: RankMath SEO, Redirection, WPForms Lite, Redis Object Cache.
- **Plugins installed but deactivated**: Wordfence (see Known Issues).
- **Mu-plugins**: `hardening.php`, `local-seo.php`, `api-access.php` — always active.
- **Site logo**: Uploaded — `Winning_Trimming_Long_Logo.png` (from Squarespace).
- **Permalinks**: `/%postname%/` with rewrite rules in `.htaccess`.
- **Redis Object Cache**: Connected and enabled.
- **Timezone**: `Australia/Sydney`.

### Design System

The theme matches the original Squarespace site:

| Token | Value | Usage |
|---|---|---|
| Primary Green | `#3d7a00` | Buttons, banners, links (hover) |
| Accent Teal | `#0f9db5` | Nav links, secondary elements |
| Dark | `#1a1a1a` | Body text, headings |
| Light Gray | `#fafafa` | Card backgrounds, section backgrounds |
| Font | Poppins (300/400/500/600/700) | All text — loaded from Google Fonts |
| Button radius | `6px` | All primary/secondary buttons |
| Button padding | `0.85em 2em` | All CTA buttons |

Custom CSS is in `wp-content/themes/winningtrimming/style.css`. The color palette is also registered for the Gutenberg block editor in `functions.php`.

---

## Structure

```
.
├── infra/
│   ├── docker-compose.yml       # Base stack (OrbStack, port 8080, no Traefik)
│   ├── docker-compose.prod.yml  # Production override (Traefik, TLS, www redirect)
│   ├── .env.example             # Copy to .env, fill in secrets (never commit .env)
│   └── htaccess                 # Apache hardening + browser caching + redirects
├── wp-content/
│   ├── mu-plugins/              # Must-use plugins (auto-loaded)
│   │   ├── hardening.php        # Security hardening
│   │   ├── local-seo.php        # LocalBusiness JSON-LD schema
│   │   └── api-access.php       # REST API custom fields + health endpoint
│   ├── themes/
│   │   └── winningtrimming/     # Astra child theme
│   │       ├── style.css        # Custom CSS (design tokens, buttons, layout)
│   │       └── functions.php    # Google Fonts, CPTs (Projects, Testimonials), taxonomies
│   └── plugins/                 # Custom/premium plugins (via git or WP admin)
├── squarespace-url-map.txt      # URL crawl results + redirect plan
├── .gitignore
├── LICENSE
└── README.md
```

## Services

| Service | Container | Image | Healthcheck | Purpose |
|---|---|---|---|---|
| MariaDB | `winningtrimming-db` | `mariadb:${MARIADB_VERSION:-11}` | TCP + InnoDB | Database |
| Redis | `winningtrimming-redis` | `redis:${REDIS_VERSION:-7-alpine}` | PING | Object cache (256MB, allkeys-lru) |
| WordPress | `winningtrimming-wordpress` | `wordpress:${WORDPRESS_VERSION:-6.7-php8.3-apache}` | HTTP 200 | PHP/Apache |

## Networks

**Local (OrbStack)**:
| Network | Driver | Purpose |
|---|---|---|
| `winningtrimming_internal` | bridge | Inter-service communication (db, redis, wordpress) |

**Production (Hostinger)** — with `docker-compose.prod.yml` overlay:
| Network | Driver | Purpose |
|---|---|---|
| `winningtrimming_internal` | bridge | Internal service mesh |
| `traefik-public` | external | Connects to Traefik reverse proxy |

## Compose Architecture

The stack uses a **base + override** pattern:

- **`docker-compose.yml`**: Base — works on OrbStack out of the box. Port `8080:80` mapped, no Traefik labels, `winningtrimming_internal` network only.
- **`docker-compose.prod.yml`**: Production override — adds Traefik labels (TLS, www redirect, security headers), connects to `traefik-public` external network, removes port mapping.

```bash
# Local dev (OrbStack)
docker compose -f infra/docker-compose.yml up -d

# Production (Hostinger VPS)
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d
```

## Branches

| Branch | Environment |
|---|---|
| `main` | Production (winningtrimming.com.au) |
| `staging` | Staging (staging.winningtrimming.com.au) |
| `feature/*` | Dev work |

---

## Known Issues

### Wordfence — 8-second page loads in Docker

**Problem**: Wordfence adds ~8 seconds to every page load when running in Docker locally. This is because Wordfence makes outbound HTTP calls (WAF rule downloads, threat intelligence feeds) on every request, and these time out in the Docker network.

**Workaround**: Wordfence is installed but **deactivated** for local development. It should be activated only in production (Hostinger VPS), where it has full network access.

```bash
# Activate Wordfence (production only)
docker run --rm --network winningtrimming_internal --user 33:33 \
  -e WORDPRESS_DB_HOST=winningtrimming-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wt_local_db_pw_2025 \
  -e WORDPRESS_DB_NAME=wordpress \
  -v winningtrimming_wp_data:/var/www/html \
  wordpress:cli plugin activate wordfence
```

### WP-CLI from outside the container

The WordPress image does not include WP-CLI. Use the `wordpress:cli` Docker image instead, connecting to the same network and volume:

```bash
docker run --rm --network winningtrimming_internal --user 33:33 \
  -e WORDPRESS_DB_HOST=winningtrimming-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wt_local_db_pw_2025 \
  -e WORDPRESS_DB_NAME=wordpress \
  -v winningtrimming_wp_data:/var/www/html \
  wordpress:cli <command>
```

> **Note**: The `--user 33:33` flag runs as `www-data` inside the container. Without it, file permission errors occur because the WP-CLI container runs as a different UID than the WordPress container's `www-data`.

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
COMPOSE_PROJECT_NAME=winningtrimming
DB_ROOT_PASSWORD=secure_root_pw
DB_PASSWORD=secure_db_pw
ACME_EMAIL=dev@example.com
REDIS_PASSWORD=redis_pw
WP_ENVIRONMENT=local
WP_HOME=http://localhost:8080
WP_SITEURL=http://localhost:8080
WP_MEMORY_LIMIT=256M
WP_PORT=8080
```

### 2. Start Services

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Install WordPress

Visit `http://localhost:8080` and complete the install wizard, or use the automated script:

```bash
curl -s -X POST 'http://localhost:8080/wp-admin/install.php?step=2' \
  -d 'weblog_title=Winning%20Trimming' \
  -d 'user_name=admin' \
  -d 'admin_email=admin@winningtrimming.com.au' \
  -d 'admin_password=your_secure_password' \
  -d 'admin_password2=your_secure_password' \
  -d 'pw_weak=on' \
  -d 'language=en_US' \
  -o /dev/null
```

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
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d
```

### 4. Post-Deploy

```bash
# Activate Wordfence (production only)
docker run --rm --network winningtrimming_internal --user 33:33 \
  -e WORDPRESS_DB_HOST=winningtrimming-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=$DB_PASSWORD \
  -e WORDPRESS_DB_NAME=wordpress \
  -v winningtrimming_wp_data:/var/www/html \
  wordpress:cli plugin activate wordfence
```

### 5. Configure DNS

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
docker run --rm --network winningtrimming_internal --user 33:33 \
  -e WORDPRESS_DB_HOST=winningtrimming-db \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wt_local_db_pw_2025 \
  -e WORDPRESS_DB_NAME=wordpress \
  -v winningtrimming_wp_data:/var/www/html \
  wordpress:cli plugin install seo-by-rank-math redirection wpforms-lite redis-cache --activate
```

---

## Mu-Plugins

Three mu-plugins ship with the repo, always active:

| File | Purpose |
|---|---|
| `hardening.php` | Login error obscuring, REST user enumeration blocked, WP version hidden, DISALLOW_FILE_EDIT, XML-RPC disabled |
| `local-seo.php` | LocalBusiness JSON-LD schema with real business data (address: Shop 2, 25 Sara Street, Toronto NSW 2283; phone: 1300 799 882; hours: Mon-Fri 8-4, Sat 8-12), geo meta tags for the Hunter Region |
| `api-access.php` | REST API custom fields for n8n (`featured_image_url`, `categories_names`, `tags_names`) + `GET /wt/v1/health` |

---

## Squarespace to WordPress Migration Guide

### Background

The original site is a single-page Squarespace 7.1 site with 2 indexed URLs (`/home`, `/contact-us`). All content lives on the homepage as sections. A full URL crawl is saved in `squarespace-url-map.txt`.

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

### Step 3: Recreate Pages (Already Done)

These pages exist in WordPress with Gutenberg block content matching the source site:

| Squarespace Page | WordPress Slug | Status |
|---|---|---|
| Homepage (`/home`) | `/` | Done |
| About | `/about` | Done |
| Marine Upholstery | `/marine-upholstery` | Done |
| RV Upholstery | `/rv-upholstery` | Done |
| Trade Covers | `/trade-covers` | Done |
| Contact (`/contact-us`) | `/contact` | Done |
| Booking | `/booking` | Done |

### Step 4: Configure Local SEO

1. Activate **RankMath SEO**.
2. Run setup wizard.
3. **RankMath > Titles & Meta > Local SEO**:
   - Business Name: Winning Trimming
   - Type: Local Business
   - Address: Shop 2, 25 Sara Street, Toronto, NSW 2283
   - Phone: 1300 799 882
   - Service Areas: Lake Macquarie, Central Coast, Newcastle, Hunter Valley
   - Hours: Mon-Fri 8am-4pm, Sat 8am-12pm

The `local-seo.php` mu-plugin provides a LocalBusiness JSON-LD schema fallback with real business data.

### Step 5: 301 Redirects

**At DNS cutover**, add these redirects in the **Redirection** plugin (already installed):

| Source | Target | Type |
|---|---|---|
| `/home` | `/` | 301 |
| `/contact-us` | `/contact` | 301 |
| `/cart` | `/` | 301 |

**Using .htaccess:**
```apache
# BEGIN Squarespace 301 Redirects
Redirect 301 /home /
Redirect 301 /contact-us /contact
Redirect 301 /cart /
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
- [ ] Enable Redis Object Cache plugin (already enabled locally)
- [ ] Set up UpdraftPlus automated backups (weekly to cloud)
- [ ] Configure Wordfence in "Learning Mode" for 1 week (activate in production only)
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

# Stop (keep volumes)
docker compose -f infra/docker-compose.yml down

# Full teardown (destroy volumes)
docker compose -f infra/docker-compose.yml down -v

# Shell into container
docker exec -it winningtrimming-wordpress bash

# Database backup
docker exec winningtrimming-db mariadb-dump -u root -p"$DB_ROOT_PASSWORD" wordpress \
  > backup-$(date +%Y%m%d).sql

# Database restore
docker exec -i winningtrimming-db mariadb -u root -p"$DB_ROOT_PASSWORD" wordpress \
  < backup.sql

# Redis CLI
docker exec -it winningtrimming-redis redis-cli -a "$REDIS_PASSWORD"

# Redis flush cache
docker exec winningtrimming-redis redis-cli -a "$REDIS_PASSWORD" FLUSHALL
```

---

## Security Hardening Summary

| Layer | Measure |
|---|---|
| Traefik (prod) | TLS 1.2+, HSTS (preload), CSP, XSS filter, frame options, permissions policy |
| .htaccess | XML-RPC blocked, author enumeration blocked, wp-cron external access blocked |
| WordPress | DISALLOW_FILE_EDIT, WP version hidden, REST user endpoints removed, login errors obscured, DISABLE_WP_CRON (run via system cron instead) |
| Docker | Internal network isolation, healthchecks, secrets via env vars |
| Plugins | Wordfence firewall + malware scanning (production only) |

---

## Changelog

### v1.1.0 (2025-05-19)

- **Project name**: Changed from `infra` to `winningtrimming` via `COMPOSE_PROJECT_NAME` in `.env`
- **Speed fix**: Identified Wordfence as cause of 8s page loads in Docker. Deactivated locally, documented in Known Issues
- **DISABLE_WP_CRON**: Added to wp-config to prevent loopback HTTP timeout
- **WP-CLI guide**: Documented `--user 33:33` flag for `wordpress:cli` container (permission fix)
- **README**: Added Local Dev Credentials table, Current State section, Design System token table, Known Issues section

### v1.0.0 (2025-05-19)

- Initial repository structure
- Docker Compose stack: WordPress, MariaDB, Redis with healthchecks
- Traefik reverse proxy overlay for production (TLS, www redirect, security headers)
- Mu-plugins: security hardening, local SEO schema, API access for n8n
- Astra child theme with Projects + Testimonials CPTs + Service Categories taxonomy
- 7 content pages matching original Squarespace structure
- Site logo uploaded, Poppins font configured, green/teal/light-gray design tokens
- .htaccess with rewrite rules, caching directives, redirect placeholder
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
4. `docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d`.
5. `wp cache flush` via WP-CLI.
