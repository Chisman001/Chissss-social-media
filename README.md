# chissss 🌐💬

**chissss** is a modern social media web application — *whispers becoming conversations.*
A clean, fast platform for sharing short posts, following people, and keeping up with what matters.

---

## Features

- **User Authentication** — Email/password sign-up & login with bcrypt hashing, plus optional GitHub OAuth via NextAuth v5
- **Create & Share Posts** — Rich posts with text (up to 2,000 characters) and media attachments (image upload)
- **Media Uploads** — Direct client-to-cloud uploads using presigned URLs (no server proxying of files)
- **Like & Engage** — Like posts with optimistic UI updates powered by TanStack Query
- **Comments System** — Threaded comment discussions under every post
- **Follow System** — Follow and unfollow users, with follower/following counts on profiles
- **User Profiles** — Personalized `@handle` profiles with display name, bio, and avatar
- **Notifications** — In-app notifications for likes, comments, and follows, with unread badge
- **Settings** — Edit display name, bio, and profile avatar
- **Discover** — Find new people to follow
- **Rate Limiting** — Sliding-window rate limits on writes and registration via Upstash Redis
- **Responsive Design** — Mobile-first layout that works across all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, React Server Components) |
| Language | TypeScript 5 |
| UI Components | Shadcn UI, Radix UI |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Authentication | NextAuth v5 (Auth.js) with Prisma Adapter |
| OAuth Provider | Google OAuth 2.0 (+ optional GitHub) |
| Database | PostgreSQL via [Neon](https://neon.tech/) (serverless) |
| ORM | [Prisma](https://www.prisma.io/) v6 |
| Object Storage | [Cloudflare R2](https://www.cloudflare.com/products/r2/) (S3-compatible, via AWS SDK v3) |
| Rate Limiting | [Upstash Redis](https://upstash.com/) + `@upstash/ratelimit` (sliding window) |
| Server Actions | [next-safe-action](https://next-safe-action.dev/) with Zod validation |
| Data Fetching | [TanStack React Query v5](https://tanstack.com/query) |
| Password Hashing | bcryptjs |
| Form Validation | Zod |
| Testing | Vitest |

---

## Project Structure

```
chissss/
├── app/
│   ├── (marketing)/        # Landing page
│   ├── (auth)/             # Sign-in / register pages
│   └── (app)/              # Authenticated app shell
│       ├── feed/           # Home feed
│       ├── discover/       # User discovery
│       ├── notifications/  # Notifications page
│       ├── settings/       # Profile settings
│       ├── post/[id]/      # Single post view
│       └── u/[handle]/     # User profile page
├── actions/                # next-safe-action server actions
│   ├── post-actions.ts
│   ├── engagement-actions.ts
│   ├── follow-actions.ts
│   ├── notification-actions.ts
│   ├── upload-actions.ts
│   ├── profile-actions.ts
│   └── register-action.ts
├── components/             # Shared UI components
│   ├── ui/                 # Base Shadcn UI primitives
│   ├── post-card/
│   ├── compose-post/
│   ├── like-button/
│   ├── follow-button/
│   ├── comment-thread/
│   ├── notification-bell/
│   ├── settings-form/
│   ├── user-avatar/
│   ├── app-shell/
│   └── providers/
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── ratelimit.ts        # Upstash rate limiters
│   ├── safe-action.ts      # next-safe-action client
│   ├── media-url.ts        # Cloudflare R2 public URL builder
│   ├── normalize-email.ts
│   └── storage/            # S3 presign, upload policy, verification
├── prisma/
│   └── schema.prisma       # Database schema
├── auth.ts                 # NextAuth config + credentials provider
└── auth.config.ts          # Shared auth config (OAuth providers)
```

---

## Database Schema

Models: `User` · `Post` · `Media` · `Comment` · `PostLike` · `Follow` · `Notification` · `Account` · `Session`

---

## Setup & Installation

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech/) free tier)
- A Cloudflare R2 bucket (optional — media uploads disabled if not configured)
- An Upstash Redis database (optional — rate limiting disabled if not configured)
- Google OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chissss.git
cd chissss
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
# Auth
AUTH_SECRET=your_auth_secret

# Google OAuth
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (optional)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...?sslmode=require
DIRECT_URL=postgresql://...?sslmode=require

# Cloudflare R2 (optional — enables media uploads)
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
S3_BUCKET_PUBLIC=
S3_ENDPOINT=
S3_ENDPOINT_PUBLIC=
S3_REGION=auto
NEXT_PUBLIC_MEDIA_BASE_URL=

# Upstash Redis (optional — enables rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client + build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## Future Improvements

- Direct messaging (DMs)
- Reposts / quote posts
- Full-text post search
- Push notifications
- Analytics dashboard
- Dark mode toggle
- Infinite scroll pagination

---

## License

This project is licensed under the MIT License.

---

## Author

Built by **Chisom Emmanuel**

---

> If you like this project, give it a ⭐ on GitHub!
