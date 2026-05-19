# winningtrimming.com.au

WordPress site for **Winning Trimming** — Marine, RV, and Trade upholstery & covers serving the Hunter Region (Lake Macquarie, Central Coast, Newcastle, Hunter Valley), NSW, Australia.

Docker + Traefik + Redis + MariaDB stack, deployed to Hostinger VPS.

## Structure

```
infra/
  docker-compose.yml   # Traefik labels, service definitions (WordPress + MariaDB + Redis)
  .env.example         # Copy to .env, fill in secrets (never commit .env)
  htaccess             # Apache hardening rules + browser caching + redirect placeholder
wp-content/
  mu-plugins/          # Must-use plugins (security hardening, local SEO schema, API access)
  themes/              # winningtrimming child theme (Astra parent)
  plugins/             # Custom/premium plugins (add via git or WP admin)
```

## Services

| Service | Container | Image | Purpose |
|---|---|---|---|
| MariaDB | `winningtrimming-db` | `mariadb:11` | Database |
| Redis | `winningtrimming-redis` | `redis:7-alpine` | Object cache (256MB max, allkeys-lru eviction) |
| WordPress | `winningtrimming-wordpress` | `wordpress:latest` | PHP/Apache with Traefik reverse proxy |

## Branches

| Branch | Environment |
|---|---|
| `main` | Production (winningtrimming.com.au) |
| `staging` | Staging (staging.winningtrimming.com.au) |
| `feature/*` | Dev work |

---

## Quick Start: Local Development (OrbStack)

### Prerequisites

- [OrbStack](https://orbstack.dev) installed on macOS
- Docker Compose available
- Git

### 1. Clone & Configure

```bash
git clone git@github.com:Smith-Gray-Pty-Ltd/winningtrimming-com-au.git
cd winningtrimming-com-au
cp infra/.env.example infra/.env
```

Edit `infra/.env`:
```env
DB_ROOT_PASSWORD=your_secure_root_password
DB_PASSWORD=your_secure_db_password
ACME_EMAIL=your@email.com
REDIS_PASSWORD=your_redis_password
WP_ENVIRONMENT=local
WP_HOME=http://localhost:8080
WP_SITEURL=http://localhost:8080
```

### 2. Start Services

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Install WordPress

Visit `http://localhost:8080` and complete the install wizard.

### 4. Mount Custom Code (wp-content)

For local development, mount the `wp-content` directory into the container by adding to `docker-compose.yml` under `wordpress.volumes`:

```yaml
volumes:
  - wp_data:/var/www/html
  - ../wp-content/themes/winningtrimming:/var/www/html/wp-content/themes/winningtrimming
  - ../wp-content/mu-plugins:/var/www/html/wp-content/mu-plugins
  - ../wp-content/plugins:/var/www/html/wp-content/plugins
```

---

## Production Deploy: Hostinger VPS

### 1. SSH into VPS

```bash
ssh root@your-hostinger-vps-ip
```

### 2. Install Traefik (if not already running)

```bash
mkdir -p /docker/traefik
cd /docker/traefik
```

Create `docker-compose.yml` for Traefik:
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
```

Start Traefik:
```bash
docker compose up -d
```

### 3. Deploy WordPress Stack

```bash
mkdir -p /docker/winningtrimming
cd /docker/winningtrimming
git clone git@github.com:Smith-Gray-Pty-Ltd/winningtrimming-com-au.git .
cp infra/.env.example infra/.env
# Edit .env with production values
docker compose -f infra/docker-compose.yml up -d
```

### 4. Copy htaccess

The `htaccess` file should be placed at `/var/www/html/.htaccess` inside the container or copied during CI/CD.

---

## Recommended Plugins

Install these via WP Admin after initial setup:

| Plugin | Purpose | Free/Premium |
|---|---|---|
| Astra (parent theme) | Lightweight, SEO-optimized theme | Free |
| Astra Pro | Advanced headers, blog layouts | Premium |
| RankMath SEO | Local SEO, schemas, sitemaps | Free + Premium |
| RankMath SEO PRO | Advanced schema, local SEO | Premium |
| Redirection | 301 redirect management | Free |
| WP Rocket | Page caching, CSS/JS minification | Premium |
| Redis Object Cache | Redis-backed object caching | Free |
| WPForms | Contact forms, booking inquiries | Free + Premium |
| Wordfence | Firewall + malware scan | Free + Premium |
| UpdraftPlus | Backups to remote storage | Free + Premium |
| CPUI (Custom Post Type UI) | Register CPTs (if not using theme functions) | Free |
| Imagify | Image optimization/WebP conversion | Freemium |

### Plugin Installation (WP-CLI)

```bash
docker exec -it winningtrimming-wordpress wp plugin install rank-math-seo redirection wordfence wpforms-lite redis-cache updraftplus --activate
docker exec -it winningtrimming-wordpress wp theme install astra --activate
docker exec -it winningtrimming-wordpress wp theme activate winningtrimming
```

---

## Mu-Plugins

Three mu-plugins ship with the repo (always active, no activation required):

| File | Purpose |
|---|---|
| `hardening.php` | Security: hide login errors, block user enumeration via REST, remove WP version, disable file editing, disable XML-RPC |
| `local-seo.php` | LocalBusiness JSON-LD schema, geo meta tags for Hunter Region |
| `api-access.php` | REST API custom fields for n8n, registers `featured_image_url`, `categories_names`, `tags_names`, and `/wt/v1/health` endpoint |

---

## Squarespace to WordPress Migration Guide

### Step 1: Audit the Squarespace Site

Before migration, document every URL on the existing Squarespace site:

```bash
# Crawl the site to get a URL list
wget --spider --recursive --no-verbose https://winningtrimming.com.au/ 2>&1 | grep "URL:" | awk '{print $3}' > squarespace-urls.txt
```

Or use Screaming Frog SEO Spider (free up to 500 URLs).

### Step 2: Extract Content from Squarespace

1. **Pages**: Copy-paste content from each Squarespace page. There's no automated export for page content.
2. **Images**: Download all images manually or via browser dev tools.
3. **Blog Posts** (if any): Squarespace supports basic XML export — check Settings > Advanced > Import/Export.
4. **Forms**: Note all form configurations; recreate in WPForms.

### Step 3: Recreate Pages in WordPress

Create pages matching the original Squarespace slugs:

| Squarespace Page | WordPress Slug | Notes |
|---|---|---|
| Homepage | `/` | Hero, services overview, CTA |
| About | `/about` | Business history, team, Hunter Region focus |
| Marine Upholstery | `/marine-upholstery` | Service detail page |
| RV Upholstery | `/rv-upholstery` | Service detail page |
| Trade Covers | `/trade-covers` | Service detail page |
| Projects/Portfolio | `/projects` | Archive for Project CPT |
| Contact | `/contact` | WPForms + Workshop Software link |
| Booking | `/booking` | Link to Workshop Software booking |

### Step 4: Configure Local SEO

1. Install and activate **RankMath SEO**.
2. Run the setup wizard.
3. Under **RankMath > Titles & Meta > Local SEO**, configure:
   - Business Name: Winning Trimming
   - Business Type: Local Business
   - Address: Lake Macquarie, NSW
   - Service Areas: Lake Macquarie, Central Coast, Newcastle, Hunter Valley
   - Phone, opening hours
4. The `local-seo.php` mu-plugin adds JSON-LD schema automatically as a fallback.

### Step 5: 301 Redirects

All old Squarespace URLs must 301 redirect to the corresponding new WordPress URLs. Add these to `.htaccess` OR use the **Redirection** plugin:

**Using Redirection plugin (recommended):**
- Install and activate Redirection
- Go to Tools > Redirection
- Add each redirect manually, or bulk-import via CSV

**Using .htaccess:**
```
# BEGIN Squarespace 301 Redirects
Redirect 301 /marine /marine-upholstery
Redirect 301 /rv-services /rv-upholstery
Redirect 301 /commercial /trade-covers
Redirect 301 /gallery /projects
Redirect 301 /enquire /contact
# END Squarespace 301 Redirects
```

> **Critical**: Test every redirect after DNS switch. Broken redirects damage SEO rankings immediately.

### Step 6: Post-Migration Checklist

- [ ] Submit XML sitemap to Google Search Console (`/sitemap_index.xml`)
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify Google Business Profile is claimed and linked
- [ ] Test all forms (contact, booking)
- [ ] Test mobile responsiveness
- [ ] Run PageSpeed Insights (target 90+ mobile)
- [ ] Set up Google Analytics 4 (RankMath can inject the tag)
- [ ] Add site to RankMath Analytics
- [ ] Configure WP Rocket (page cache, CSS/JS minification, lazy loading)
- [ ] Enable Redis Object Cache plugin
- [ ] Set up UpdraftPlus automated backups (weekly to cloud storage)
- [ ] Configure Wordfence firewall in "Learning Mode" for 1 week
- [ ] Test REST API endpoints for n8n integration

---

## Local SEO Best Practices (Australian Service Business)

### On-Page

1. **Title tags**: Include primary service + location.
   - Example: `Marine Upholstery Lake Macquarie | Winning Trimming`
2. **H1 tags**: One per page, include primary keyword naturally.
3. **Meta descriptions**: 150-160 chars, include location + call to action.
4. **Schema**: LocalBusiness JSON-LD is included via mu-plugin. Verify with Google's Rich Results Test.
5. **NAP consistency**: Business Name, Address, Phone identical across all platforms.
6. **Service area pages**: Create dedicated pages for each major location:
   - `/marine-upholstery-newcastle`
   - `/rv-upholstery-central-coast`
   - `/trade-covers-hunter-valley`

### Off-Page

1. **Google Business Profile**: Fully optimized, weekly posts, respond to reviews.
2. **Australian directories**: True Local, Yellow Pages, Hotfrog, Yelp AU, Oneflare.
3. **Industry directories**: Marine industry associations, BIA (Boating Industry Association).
4. **Local citations**: Local chamber of commerce, Lake Macquarie business directory.
5. **Reviews strategy**: Automate review requests post-service (n8n can help).

### Technical

1. **Page speed**: Astra + WP Rocket + Redis + WebP images = fast loading.
2. **Mobile-first**: Astra is fully responsive; test all service pages.
3. **Sitemap**: RankMath auto-generates XML sitemap with all CPTs included.
4. **SSL**: Traefik auto-provisions Let's Encrypt certificates.
5. **Structured data**: LocalBusiness, Service, Review, FAQ schemas via RankMath.

---

## n8n Integration

This repo is designed to work with the **n8n-smb-agent-template** for automated content, SEO, and social media management.

### Setup: Application Password

1. In WordPress Admin, go to **Users > Profile**.
2. Scroll to **Application Passwords**.
3. Create a new password named `n8n-integration`.
4. Copy the generated password.

### Setup: n8n HTTP Request Node

**Base URL**: `https://winningtrimming.com.au/wp-json/wp/v2`

**Headers**:
```
Authorization: Basic base64(username:application_password)
Content-Type: application/json
```

**Key Endpoints**:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/posts` | List blog posts |
| POST | `/posts` | Create blog post |
| GET | `/posts?categories=X` | Posts by category |
| POST | `/media` | Upload image |
| GET | `/project` | List projects (CPT) |
| POST | `/project` | Create project |
| GET | `/wp/v2/categories` | List categories |
| GET | `/wp/v2/tags` | List tags |
| GET | `/wt/v1/health` | Site health check (custom endpoint) |

### Example: Create a Blog Post via n8n

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

1. **Auto-blog from Google Business Profile posts**: Pull GBP posts → create WordPress drafts.
2. **Project showcase**: When a new project CPT is published, auto-post to GBP and social media.
3. **Review monitoring**: Check Google reviews weekly → create a "Recent Reviews" post.
4. **Seasonal content**: Schedule location-specific content (e.g., "Summer boat prep in Lake Macquarie").
5. **Service area pages**: Generate location pages from a Google Sheets data source.

### Custom REST Endpoints

The `api-access.php` mu-plugin registers:

- `GET /wp-json/wt/v1/health` — Returns site status, time, and timezone. Requires authentication.
- Custom fields on posts: `featured_image_url`, `categories_names`, `tags_names`.

---

## Docker Management Commands

```bash
# Start all services
docker compose -f infra/docker-compose.yml up -d

# View logs
docker compose -f infra/docker-compose.yml logs -f wordpress

# Restart a service
docker compose -f infra/docker-compose.yml restart wordpress

# Stop all services
docker compose -f infra/docker-compose.yml down

# Enter WordPress container
docker exec -it winningtrimming-wordpress bash

# Run WP-CLI command
docker exec -it winningtrimming-wordpress wp plugin list
docker exec -it winningtrimming-wordpress wp cache flush
docker exec -it winningtrimming-wordpress wp rewrite flush

# Database backup
docker exec winningtrimming-db mysqldump -u root -p"$DB_ROOT_PASSWORD" wordpress > backup-$(date +%Y%m%d).sql

# Restore database
docker exec -i winningtrimming-db mysql -u root -p"$DB_ROOT_PASSWORD" wordpress < backup.sql

# Redis CLI
docker exec -it winningtrimming-redis redis-cli -a "$REDIS_PASSWORD"
```

---

## Security Hardening Summary

| Layer | Measure |
|---|---|
| Traefik | TLS 1.2+, HSTS, CSP, XSS filter, frame options, permissions policy |
| .htaccess | XML-RPC blocked, username enumeration blocked, wp-cron blocked externally |
| WordPress | DISALLOW_FILE_EDIT, WP version hidden, REST user endpoints removed, login errors obscured |
| Plugins | Wordfence firewall + malware scanning |
| Docker | Non-root containers, secret environment variables |

---

## CI/CD (Future)

Recommended pipeline for Hostinger VPS:

1. Push to `main` branch
2. GitHub Actions SSH into VPS
3. `git pull` in `/docker/winningtrimming`
4. `docker compose -f infra/docker-compose.yml up -d --build`
5. Cache flush via WP-CLI
