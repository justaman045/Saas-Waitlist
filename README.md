# Projekt Notify – Multi‑App Waitlist Studio 🚀

Projekt Notify is a fully reusable **SaaS waitlist management platform** built using **Next.js 14**, **Tailwind CSS**, and **Firebase**.  
It lets you create, customize, and track waitlists for all your app ideas under one unified dashboard.

Perfect for indie founders, solo developers, and SaaS builders.

---

## ✨ Features

### 🚀 Multi‑Project Waitlists
- Create unlimited projects
- Each project gets a public waitlist page
- Custom titles, descriptions, features, FAQs & gallery

### 🧠 Smart Dashboard
- Overview of all your projects
- Total signups and referral tracking
- Analytics powered by Firestore

### 📝 Built‑in Editor
- Edit every project from a dedicated editor
- Upload screenshots to Firebase Storage
- Manage features, FAQs & descriptions

### 🔗 Automatic Referral System
- Users get a referral link
- Referrals boost their waitlist position
- Perfect for viral growth

### 📩 Email Launch System
- Send launch emails to all subscribers
- Uses **Resend**
- Works via secure Firebase Admin SDK

### 🌓 Light & Dark Mode
- Switch themes instantly
- Fully responsive UI

### 🪄 SEO-Optimized Public Pages
- Dynamic OpenGraph metadata
- Twitter preview cards
- Beautiful project landing pages

### 🤝 Creator Profile (Auto‑Sync)
- Pulls GitHub and LinkedIn profile details
- Auto‑refreshes your avatar, repo count, followers, description, etc.

---

## 🧰 Tech Stack

### Frontend
- **Next.js 14 (App Router)**
- **React**
- **Tailwind CSS**
- **Shadcn UI Components**

### Backend
- **Firebase**
  - Cloud Firestore (Database)
  - Firebase Authentication
  - Firebase Storage
  - Firebase Admin SDK (Server-side)

### Other Integrations
- **Resend** (email delivery)
- **AllOrigins** (metadata fetching)

---

## 📦 Project Structure

```
src/
  app/
    api/
      projects/
      profile/
    dashboard/
    p/[slug]/
  components/
  lib/
    firebase.ts
  styles/
```

---

## 🛠 Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAIL=

RESEND_API_KEY=
LAUNCH_FROM_EMAIL=
```

---

## 🧪 Running Locally

```sh
npm install
npm run dev
```

---

## 🚀 Deployment

Projekt Notify is optimized for:

- **Vercel** (recommended)
- **Firebase Hosting** (optional)

Deploy with:

```sh
vercel --prod
```

Make sure all environment variables are added to Vercel.

---

## 📈 Roadmap

- [ ] Project-level analytics dashboard  
- [ ] Automatic OG image generator  
- [ ] Drag & drop gallery uploader  
- [ ] Custom domain for each project  
- [ ] Export signups to CSV  
- [ ] Full SaaS monetization system (Pro tier)

---

## 🙌 Creator

**Aman Ojha**  
Tech writer • Video wizard • SDET • Open-source builder  
Building futuristic SaaS tools one project at a time.

GitHub: https://github.com/justaman045  
LinkedIn: https://linkedin.com/in/aman-ojha/

---

## ⭐ Contributing

Contributions are welcome!  
Open an issue or submit a pull request.

---

## 📄 License

MIT License – free to modify, share, and use commercially.
