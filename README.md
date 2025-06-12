# 📚 BookBase

A library web app built with Next.js and TypeScript. BookBase allows users to browse, search, and explore book collections with a clean, responsive UI powered by Tailwind CSS.

## Table of Contents

1. [Demo](#demo)  
2. [Tech Stack](#tech-stack)  
3. [Features](#features)  
4. [Getting Started](#getting-started)  
5. [Project Structure](#project-structure)  


---

## Demo
https://bookbase-three.vercel.app/
---

## Tech Stack

- **Next.js** (React framework for production)
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **ESLint + Prettier** for code quality
- **Vercel** for deployment

---

## Features

- 📖 Browse a curated list of books  
- 🔍 Search books by title, author, or genre  
- 📑 View detailed book info (description, author, rating, etc.)  
- 🖥️ Fully responsive UI across desktop and mobile  

---

## Getting Started

### Prerequisites

- Node.js ≥ v16  
- npm, Yarn, pnpm, or Bun  

# Project Structure
.
├── README.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── (auth)
│   │   ├── api
│   │   ├── dashboard
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── test.css
│   ├── components
│   │   ├── books
│   │   ├── features
│   │   ├── layout
│   │   ├── profile
│   │   └── ui
│   ├── context
│   ├── hooks
│   │   ├── useAuth.tsx
│   │   ├── useBooks.tsx
│   │   ├── useCheckouts.ts
│   │   └── useUsers.tsx
│   ├── lib
│   │   ├── api.ts
│   │   ├── email.ts
│   │   └── utils.ts
│   ├── server
│   │   ├── controller
│   │   ├── lib
│   │   ├── middleware
│   │   ├── routes
│   │   └── server.ts
│   └── types
│       ├── database.ts
│       └── index.ts
├── tailwind.config.js
├── tsconfig.json
└── vercel.json


### Installation

```bash
git clone https://github.com/anjiraterry/bookbase.git
cd bookbase
npm install        # or yarn / pnpm / bun
