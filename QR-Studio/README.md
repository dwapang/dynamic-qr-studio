# QR Studio

A modern, fast, and feature-rich QR Code management studio built with Next.js 14, Tailwind CSS, and SQLite. Generate direct static QR codes or dynamic redirect QR codes with real-time scan analytics and custom styling.

Developed by **Diky Wahyudi**.

---

## Features

- **Direct QR Code**: Generates clean QR codes that encode your target URL directly. Scans instantly on any device camera without going through a redirect server.
- **Dynamic QR Code**: Short redirect links (`/r/[slug]`) that allow changing the destination target URL anytime while tracking scan metrics.
- **Custom QR Studio & Designer**:
  - 13 curated color themes (Midnight, Oceanic Teal, Burnt Sienna, Rose Garden, Electric Blue, etc.) plus custom hex color pickers.
  - Custom dot patterns (Square, Rounded, Circles, Classy Smooth).
  - Custom corner eye frames and center dots.
  - Custom logo upload and preset icon embedding with automatic Error Correction Level H (30%).
  - High-resolution export in PNG (Web, HD, Print up to 2048px) and scalable vector SVG.
  - One-click copy image to clipboard.
- **Real-time Analytics**:
  - Total scans, scans today, and unique device fingerprints.
  - Interactive daily scan volume chart and device breakdown (Mobile, Desktop, Tablet).
  - Operating system and browser distribution.
  - Detailed scan log history with timestamps, device details, and IP addresses.
- **Dark Mode**: Native system & manual dark mode toggle with persistent state.
- **Clean UI**: Editorial and human-centric design with zero decorative emoji clutter.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: SQLite (via Node.js built-in `node:sqlite`), compatible with local development and serverless environments.

---

## Getting Started (Local Development)

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd "QR Generator"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment to Netlify

This project is pre-configured for seamless deployment to Netlify via GitHub:

1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - QR Studio"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. Go to [Netlify](https://app.netlify.com/) and click **"Add new site"** > **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node.js version**: `22`
5. Click **"Deploy site"**. Your application will be live in minutes.

---

## License

MIT License. Created by Diky Wahyudi.
