# Taxtron App

A production-quality Android-first mobile app for Taxtron, built with React Native + Expo + TypeScript. This is a **separate project** from the [taxtron-api](https://github.com/gamershu023-png/taxtron-api) web backend. The existing Taxtron API continues serving taxtron.in independently.

## Table of Contents

- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)
- [Android Builds](#android-builds)
- [V1 Feature Status](#v1-feature-status)
- [Future Features](#future-features)

---

## Architecture

| Layer | Responsibility |
|---|---|
| `src/screens/` | One screen per tab: Home, AI, Scan, Tools, Profile |
| `src/components/` | Reusable UI: ChatBubble, ChatInput, PrimaryButton, TextField, EmptyState, ErrorState, LoadingDots, ImagePreview |
| `src/hooks/` | Business logic: `useChat` (chat state + API calls + local persistence), `useAuth` (Supabase auth state) |
| `src/services/` | `api.ts` (Taxtron AI proxy client), `auth.ts` (Supabase client + auth functions) |
| `src/storage/` | `chatHistory.ts` (AsyncStorage-based local chat session persistence) |
| `src/theme/` | Colors, spacing, typography, shadows matching the Taxtron web brand |
| `src/types/` | Shared TypeScript types + navigation param list |

### Design Decisions

- **Local-first chat history**: Conversations are stored in AsyncStorage. The storage layer (`chatHistory.ts`) is the only module that touches AsyncStorage, so swapping to cloud sync later means changing one file.
- **No WebView**: The app is built with native React Native components throughout.
- **No secrets in the app binary**: The Taxtron AI proxy (`/api/generate`) requires no client-side API key. Supabase anon key is a public key safe for mobile use.
- **Secure token storage**: Supabase session tokens are stored via `expo-secure-store` (Android Keystore).

---

## API Integration

The app reuses the **existing Taxtron AI proxy** hosted on Vercel:

| Endpoint | Method | Input | Output | Used By |
|---|---|---|---|---|
| `POST /api/generate` | POST | `{ topic: string, image?: string }` | `{ result: string }` or `{ error: string }` | AI screen |

- The endpoint is stateless and CORS-enabled, making it suitable for mobile.
- No API key is needed from the client.
- The URL is configured via `EXPO_PUBLIC_API_URL` — no hardcoding.
- If the endpoint becomes unsuitable for mobile, only `src/services/api.ts` needs to change.

### What is NOT reused

- **Firebase Auth**: The web app uses Firebase Google popup auth. Popup auth doesn't work on mobile. The app uses Supabase email/password instead. Google Sign-In can be added in V2 via `expo-auth-session`.
- **Firestore direct writes**: The web app writes chat history directly to Firestore. The mobile app uses local AsyncStorage for V1, with architecture allowing cloud sync later.
- **No API keys are copied** into the app. The Firebase web API key in the web repo is intentionally not used.

---

## Authentication

The app uses **Supabase email/password auth** — the same Supabase project already provisioned for the web app's `/explore` page.

- Sign in, sign up, and sign out are fully implemented in the Profile tab.
- Session tokens are securely stored via `expo-secure-store`.
- If Supabase is not configured (env vars missing), the Profile screen shows a helpful message instead of crashing.
- Guest mode is implicit — the app works without signing in; only chat history won't sync.

---

## Project Structure

```
taxtron-app/
├── app.json              # Expo config (Android: package in.taxtron.app, SDK 36)
├── eas.json              # EAS Build profiles (development, preview/APK, production/AAB)
├── babel.config.js
├── tsconfig.json
├── .env.example          # Copy to .env and fill in
├── package.json
└── src/
    ├── App.tsx           # Entry point — navigation + tab bar
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── AIScreen.tsx
    │   ├── ScanScreen.tsx
    │   ├── ToolsScreen.tsx
    │   └── ProfileScreen.tsx
    ├── components/
    │   ├── ChatBubble.tsx
    │   ├── ChatInput.tsx
    │   ├── EmptyState.tsx
    │   ├── ErrorState.tsx
    │   ├── ImagePreview.tsx
    │   ├── LoadingDots.tsx
    │   ├── PrimaryButton.tsx
    │   └── TextField.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useChat.ts
    ├── services/
    │   ├── api.ts         # Taxtron AI proxy client
    │   └── auth.ts       # Supabase auth
    ├── storage/
    │   └── chatHistory.ts # AsyncStorage persistence
    ├── theme/
    │   └── index.ts      # Colors, spacing, typography, shadows
    └── types/
        ├── index.ts
        └── nav.ts
```

---

## Installation

```bash
# 1. Clone this repository
git clone <your-taxtron-app-repo-url>
cd taxtron-app

# 2. Install dependencies
npm install

# 3. Copy environment config
cp .env.example .env
# Edit .env with your values (see below)
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# The existing Taxtron AI proxy URL (no API key needed)
EXPO_PUBLIC_API_URL=https://project-0wxuy.vercel.app

# Supabase project (for email/password auth)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These values are read at build time via Expo's `EXPO_PUBLIC_` prefix. They are **not** secrets — the API proxy needs no key, and the Supabase anon key is designed for client-side use. Do not store any server-side secrets (service role keys, Gemini API keys) in the mobile app.

---

## Running the App

```bash
# Start the Expo dev server
npm start

# Press 'a' to open on an Android emulator, or scan the QR code with Expo Go
# For a device with a dev build:
npm run android
```

---

## Android Builds

This project is configured for Google Play production with:
- **Package ID**: `in.taxtron.app`
- **Target SDK**: 36 (required by Google Play for new apps as of 2025)
- **Min SDK**: 24 (Android 7.0)

### Prerequisites

1. Install the EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Link the project (first time only):
   ```bash
   eas build:configure
   ```

### 1. Development Build (for testing with dev tools)

```bash
npm run build:dev
```
Produces an APK you can install on a device for development with full debugging support.

### 2. APK for Device Testing (internal distribution)

```bash
npm run build:apk
```
Produces a release APK for testing on physical devices before Play Store submission.

### 3. Signed Android App Bundle (.aab) for Google Play

```bash
npm run build:aab
```
Produces an `.aab` file ready for upload to the Google Play Console.

**Signing**: EAS manages signing keys automatically. Do not generate or expose signing credentials manually. EAS will create and store the keystore securely. If you need to use your own keystore, configure it in the EAS dashboard — never commit keystore files to the repository.

---

## V1 Feature Status

| Feature | Status | Notes |
|---|---|---|
| Home screen | ✅ Complete | Navigation hub to all features |
| AI chat | ✅ Complete | Connects to existing Taxtron API, local history, loading/error/retry/empty states |
| Scan (camera/gallery) | ✅ UI complete | Camera permissions, image picker, preview. No backend image analysis yet. |
| Tools | ✅ UI complete | Tool cards with "Coming Soon" badges. No calculators implemented yet. |
| Profile (auth) | ✅ Complete | Supabase email/password sign in, sign up, sign out |
| Chat history (local) | ✅ Complete | AsyncStorage-based, architecture allows cloud sync later |
| Android navigation | ✅ Complete | Bottom tab navigation with back button support |
| Accessibility | ✅ Basics | Labels, roles, hints on interactive elements |

## Future Features (Placeholders)

- **Scan → AI analysis**: Sending captured images to the Taxtron API for question/diagram recognition. The API endpoint already accepts base64 images, but the analysis flow needs design work.
- **Cloud chat history sync**: The storage layer is isolated — swapping AsyncStorage for Supabase `explore_sessions`/`explore_messages` tables (already provisioned with RLS) requires changing only `src/storage/chatHistory.ts`.
- **Google Sign-In**: Via `expo-auth-session` + Firebase, for parity with the web app.
- **Tools implementation**: Physics calculator, chemistry balancer, math solver, unit converter, formula reference, mock test generator.
- **Push notifications**: Reusing the existing Firebase-based notification system.
