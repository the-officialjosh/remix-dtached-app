# Dtached — Alpha Production Readiness Checklist

> Everything **external** you need to set up, purchase, or configure outside of your codebase to get a working alpha deployment.

---

## 1. Hosting / Cloud Provider

You need a server or cloud platform to run your **3-container Docker stack** (PostgreSQL, Spring Boot backend, Nginx frontend).

| Option | Notes | Action |
|--------|-------|--------|
| **DigitalOcean Droplet** | Cheapest (\~$6–12/mo). SSH in, install Docker, run `docker compose up`. | Create account → Create Droplet (2 GB RAM min) → Install Docker |
| **Railway / Render** | Managed Docker hosting, easier but slightly pricier. | Create account → Connect GitHub → Deploy services |
| **AWS EC2 / Lightsail** | More control, free tier available. | Create account → Launch instance → Install Docker |
| **Hetzner** | Cheapest EU option (\~€4/mo). | Create account → Deploy cloud server |

> [!IMPORTANT]
> Whichever you pick, you need **at minimum 2 GB RAM** to run PostgreSQL + Spring Boot + Nginx simultaneously.

### Action Items
- [ ] Choose a hosting provider
- [ ] Create an account and provision a server
- [ ] Install Docker & Docker Compose on the server
- [ ] Open ports: **80** (HTTP), **443** (HTTPS), **22** (SSH)

---

## 2. Domain Name

You need a domain for your app (e.g. `dtached.com` or `app.dtached.com`).

### Action Items
- [ ] Purchase a domain from a registrar (Namecheap, Google Domains, Cloudflare, etc.)
- [ ] Point DNS A record to your server's IP address
- [ ] (Optional) Set up `www` CNAME → your root domain

---

## 3. SSL / HTTPS Certificate

Your `nginx.conf` currently only listens on port 80 (HTTP). For production you **must** have HTTPS.

### Action Items
- [ ] Install **Certbot** (Let's Encrypt) on your server — it's free
- [ ] Run: `certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Update `nginx.conf` to handle HTTPS (Certbot does this automatically)
- [ ] Set up auto-renewal: `crontab -e` → `0 0 * * * certbot renew`

---

## 4. Stripe (Payments)

Your `PaymentService.java` is **fully wired** with Stripe Checkout Sessions and webhook handling, but uses placeholder keys.

### Action Items
- [ ] Create a **Stripe account** at [stripe.com](https://stripe.com)
- [ ] Complete business verification (KYC) — required to accept real payments
- [ ] Get your **live API keys** from the Stripe Dashboard:
  - `STRIPE_SECRET_KEY` → set in your `.env` / Docker environment
  - `STRIPE_PUBLISHABLE_KEY` → set in your frontend config
- [ ] Create your **products** in Stripe Dashboard:
  - **Player Card** — \$9.99 (promo) / \$18 (regular)
  - **Team Tournament Entry** — \$45
- [ ] Set up a **Webhook endpoint** pointing to `https://yourdomain.com/api/payments/webhook`
  - Subscribe to event: `checkout.session.completed`
  - Get the `STRIPE_WEBHOOK_SECRET` → set in your `.env`
- [ ] Set these env vars in `docker-compose.yml` or `.env`:
  ```
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

> [!CAUTION]
> Your current `.env` has dev placeholder keys. **Never** deploy with `sk_test_placeholder`.

---

## 5. PostgreSQL Database (Production)

Your `docker-compose.yml` runs PostgreSQL in a container. This works for alpha, but you need to secure it.

### Action Items
- [ ] **Change the database password** from `dtached_dev_pass` to a strong, random password
- [ ] Update `.env`:
  ```
  DB_PASSWORD=<strong-random-password>
  ```
- [ ] Ensure Docker volume `pgdata` persists across restarts (already configured ✅)
- [ ] (Recommended) Set up a **database backup** schedule:
  ```bash
  docker exec dtached-db pg_dump -U dtached dtacheddb > backup_$(date +%Y%m%d).sql
  ```
- [ ] (Optional for later) Migrate to a managed DB (e.g., Supabase, AWS RDS, DigitalOcean Managed DB)

---

## 6. JWT Secret Key

Your current JWT secret is a dev placeholder that is literally in the `.env` file.

### Action Items
- [ ] Generate a **production JWT secret** (min 256-bit / 32+ chars):
  ```bash
  openssl rand -base64 64
  ```
- [ ] Set in `.env`:
  ```
  JWT_SECRET=<your-generated-secret>
  ```

> [!WARNING]
> Your current secret (`dtached-dev-secret-key-change-in-production-min-256-bits-required`) is literally telling you to change it.

---

## 7. Email Service (NOT YET IMPLEMENTED)

Your `plan.md` specifies **SendGrid** for emails (confirmation, password reset, notifications), but **zero email code exists** in the codebase. The `AuthService` generates confirmation and reset tokens but only logs them to the console.

### Action Items
- [ ] Choose an email provider:
  - **SendGrid** (as planned) — 100 emails/day free
  - **Resend** — 100 emails/day free, modern API
  - **AWS SES** — cheapest at scale
- [ ] Create an account and get an API key
- [ ] Verify a **sender domain** (e.g. `noreply@dtached.com`) — requires DNS records (SPF, DKIM, DMARC)
- [ ] **Build an `EmailService.java`** in the backend to replace console logging with real email delivery
- [ ] Wire email sending into:
  - Registration confirmation (`AuthService.register`)
  - Password reset (`AuthService.requestPasswordReset`)
  - Notifications (team approvals, match updates, etc.)

> [!IMPORTANT]
> Without email, users **cannot confirm their accounts or reset passwords** in production. This is a blocker.

---

## 8. Cloud Storage for Media (NOT YET IMPLEMENTED)

The `MediaService` only reads from the DB — no file upload or cloud storage is wired. Your `plan.md` specifies cloud storage for media uploads.

### Action Items (for alpha, can defer)
- [ ] Choose a storage provider:
  - **Cloudinary** — free tier (25 GB), built-in image transforms
  - **AWS S3** — cheapest at scale
  - **DigitalOcean Spaces** — S3-compatible, $5/mo for 250 GB
  - **Supabase Storage** — 1 GB free
- [ ] Create an account and get credentials
- [ ] Build a file upload endpoint in the backend
- [ ] Store URLs in the `media` table (current schema supports this ✅)

> [!NOTE]
> For alpha, you can **defer** this and use external image URLs (as the seed data does with `picsum.photos`). But real file uploads need a storage provider.

---

## 9. CORS / Frontend URL Configuration

Your `CorsConfig.java` allows origins from `localhost:5173` and `localhost:3000`. In production, you need your actual domain.

### Action Items
- [ ] Set the `app.cors.allowed-origins` property to your production domain:
  ```
  app.cors.allowed-origins=https://yourdomain.com,https://www.yourdomain.com
  ```
- [ ] Set `app.frontend-url` for redirect URLs:
  ```
  FRONTEND_URL=https://yourdomain.com
  ```

---

## 10. Production `.env` File

Collect all secrets into a single production `.env`. **Do not commit this to Git.**

### Final `.env` Template
```env
# Database
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<generated-256-bit-secret>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
FRONTEND_URL=https://yourdomain.com

# CORS
APP_CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Email (once implemented)
# SENDGRID_API_KEY=SG...
# EMAIL_FROM=noreply@yourdomain.com
```

### Action Items
- [ ] Create the production `.env` with all real values
- [ ] Add `.env` to `.gitignore` (already done ✅)
- [ ] Copy `.env` to your production server

---

## 11. Frontend / Backend Architecture Decision

> [!WARNING]
> Your project currently has **two separate server systems running in parallel**:
> 1. **`frontend/server.ts`** — Express + SQLite (`tournament.db`) with its own API routes, seed data, and WebSocket server
> 2. **`backend/`** — Spring Boot + PostgreSQL with JWT auth, Stripe, Flyway migrations, and proper services
>
> These are **completely disconnected**. The Express server has its own database, its own models, and its own API. The Spring Boot backend has a totally different schema.

### Action Items
- [ ] **Decide**: Are you deploying the Spring Boot backend or the Express server for alpha?
  - The Spring Boot backend has auth, payments, team management, and proper architecture
  - The Express server has tournament/game-day features (live scoring, WebSocket, stats)
- [ ] **Consolidate** the tournament/game features from `server.ts` into the Spring Boot backend, OR
- [ ] **Deploy both** with a clear separation (Spring Boot for platform, Express for game-day)
- [ ] Remove the Gemini API key from frontend `.env` if not using AI features in alpha

---

## 12. Monitoring & Logging (Recommended)

### Action Items
- [ ] Set up **log persistence** — Docker logs are ephemeral by default:
  ```yaml
  # In docker-compose.yml, add to each service:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
  ```
- [ ] (Optional) Set up **Uptime monitoring** — free tools:
  - [UptimeRobot](https://uptimerobot.com) — 50 monitors free
  - [Better Stack](https://betterstack.com) — free tier
- [ ] (Optional) Set up **error tracking**:
  - [Sentry](https://sentry.io) — free tier for both Java and React

---

## Summary — Priority Order

| # | Task | Blocking? | Difficulty |
|---|------|-----------|------------|
| 1 | Hosting provider + server setup | 🔴 Yes | Medium |
| 2 | Domain name | 🔴 Yes | Easy |
| 3 | SSL/HTTPS (Certbot) | 🔴 Yes | Easy |
| 4 | Production JWT secret | 🔴 Yes | Trivial |
| 5 | Production DB password | 🔴 Yes | Trivial |
| 6 | Stripe account + live keys | 🔴 Yes (for payments) | Medium |
| 7 | Production `.env` file | 🔴 Yes | Easy |
| 8 | CORS / frontend URL config | 🔴 Yes | Trivial |
| 9 | Architecture decision (Express vs Spring Boot) | 🟡 Important | Decision |
| 10 | Email service (SendGrid / Resend) | 🟡 Needed for auth flows | Medium |
| 11 | Cloud storage for media | 🟢 Deferrable | Medium |
| 12 | Monitoring & logging | 🟢 Recommended | Easy |

---

> **Bottom line:** Items 1–8 are what you need to do **before deploying**. Items 9–10 should be resolved soon after. Items 11–12 can wait for post-alpha polish.
