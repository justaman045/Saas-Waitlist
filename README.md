# SaaS Waitlist

> **Discover, showcase, and join waitlists for upcoming SaaS projects** — a modern waitlist management platform built with Next.js 16 and Firebase.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwind-css)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## Features

- **Project Showcase** — Browse featured SaaS projects with rich detail pages, image galleries, and tech stack info
- **Waitlist Management** — Join waitlists for upcoming projects with email verification and duplicate detection
- **Admin Dashboard** — Full CRUD for projects, status management (Live / Coming Soon), image upload via Cloudinary
- **Search & Filter** — Real-time debounced search across projects with URL-based query params
- **Content Editor** — Markdown-supported project descriptions with live preview
- **Responsive Design** — Dark mode, animated UI with Framer Motion, mobile-first layout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google sign-in) |
| Storage | Cloudinary (image upload) |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Forms | react-hook-form + Zod validation |
| Deployment | Vercel |

## Getting Started

```bash
# Clone
git clone https://github.com/justaman045/SaaSWaitlist.git
cd SaaSWaitlist

# Install
npm install

# Set up environment
cp .env.example .env.local
# Fill in Firebase config and Cloudinary credentials

# Run dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK config |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK key (JSON) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Project Structure

```
app/
├── page.tsx             # Landing page (hero, features, projects grid)
├── layout.tsx           # Root layout with providers
├── admin/               # Admin dashboard (CRUD, login)
└── projects/            # Project listing + detail pages
components/
├── hero.tsx, features-section.tsx, ...
├── project-card.tsx, project-form.tsx
├── ui/                  # shadcn/ui components
└── waitlist-form.tsx    # Email capture form
lib/
└── db-service.ts        # Firestore queries
```
