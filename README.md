# Grab It

**Give. Grab. Repeat.**

Grab It is a local giving marketplace — a mobile app where people list items they no longer need and others claim them for free pickup. Listing, claiming, and pickup messaging stay free forever; optional paid upgrades (Grab It Pro) add extra listing photos, priority reserves, and a supporter badge.

Built with [Expo](https://expo.dev) / React Native, [Clerk](https://clerk.com) for auth, [Supabase](https://supabase.com) for data and edge functions, and [RevenueCat](https://www.revenuecat.com) for subscriptions.

## Features

- Post and browse local listings with photos and location
- Claim an item and chat with the owner to arrange pickup
- Push-style in-app requests and claim history
- Google sign-in and email auth via Clerk
- Grab It Pro subscription (RevenueCat): extra photos, priority reserves, supporter badge
- Native subscription management via RevenueCat's Customer Center

## Tech stack

| Layer | Tech |
|---|---|
| App | Expo (React Native), Expo Router, TypeScript |
| Auth | Clerk |
| Backend | Supabase (Postgres, Storage, Edge Functions) |
| Payments | RevenueCat (`react-native-purchases`, `react-native-purchases-ui`) |
| Maps/Location | `react-native-maps`, `expo-location` |

## Getting started

### Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io)
- An [Expo](https://expo.dev) account (for EAS builds)
- A [Clerk](https://clerk.com) application
- A [Supabase](https://supabase.com) project
- A [RevenueCat](https://www.revenuecat.com) project (Android app configured)
- Android: this app currently targets Android only — real in-app purchases require an EAS **development build**, not Expo Go

### Setup

```bash
pnpm install
```

Create a `.env` file in the project root with:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_CLERK_JWT_TEMPLATE=supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID=
```

All client-side env vars must be prefixed `EXPO_PUBLIC_` to be inlined into the app bundle — see [Expo's environment variables guide](https://docs.expo.dev/guides/environment-variables/).

### Run

```bash
npx expo start -c
```

Native modules (RevenueCat, maps) aren't available in Expo Go. For a real device/emulator with native purchases working, build a dev client:

```bash
npx expo prebuild
npx expo run:android
# or, via EAS:
eas build --profile development --platform android
```

### RevenueCat setup

See [`docs/revenuecat.md`](docs/revenuecat.md) for how the RevenueCat integration is wired up (entitlement, offerings, paywall, Customer Center) and the dashboard configuration it expects.

## Project structure

```
app/            Expo Router screens (file-based routing)
components/     Reusable UI components
services/       Client wrappers for external services (RevenueCat, etc.)
hooks/          Shared React hooks
providers/      App-level context providers
utils/          Shared utilities (e.g. Supabase client)
supabase/       Supabase config and edge functions
constants/      Theme, typography, and other constants
docs/           Integration and architecture notes
```

## License

MIT — see [LICENSE](LICENSE).
