# RevenueCat for Grab It

Grab It stays free for listing, claiming, and pickup messaging.
RevenueCat adds optional paid upgrades and ad-based unlocks around that core.

## 1. What is RevenueCat?

RevenueCat provides a backend and SDKs that wrap StoreKit, Google Play Billing, and RevenueCat Billing to make purchases easy.
- Source: https://www.revenuecat.com/docs/getting-started/installation/expo

`react-native-purchases` is the client for the subscription and purchase tracking system, wrapping StoreKit, Google Play Billing, Web Billing and the RevenueCat backend.
- Source: https://github.com/RevenueCat/react-native-purchases

Core model:
- **Products:** defined in App Store Connect / Play Console, mirrored in RevenueCat dashboard.
  - Source: https://www.revenuecat.com/guides/revenuecat-android-sdk/understanding-revenuecat
- **Entitlements:** a level of access a user is entitled to, e.g. `Grabit Pro`. Attach products to entitlement.
  - Source: https://www.revenuecat.com/docs/getting-started/entitlements
- **Offerings / Packages:** Offering = collection of Packages shown on a paywall. One Offering is Current.
  - Source: https://www.revenuecat.com/docs/offerings/overview
- **CustomerInfo:** contains all purchase data about a customer. Check `entitlements.active["Grabit Pro"]`.
  - Source: https://www.revenuecat.com/docs/customers/customer-info

Key APIs: `Purchases.configure`, `getOfferings`, `purchasePackage`, `getCustomerInfo`, `restorePurchases`, `logIn` / `logOut`, `addCustomerInfoUpdateListener`.
- Source: https://www.revenuecat.com/docs/getting-started/quickstart
- Source: https://www.revenuecat.com/docs/getting-started/making-purchases

Paywalls are remote-configured and paired to one Offering.
- Source: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls

## 2. Expo support

Officially supported. Expo lists `react-native-purchases` as compatible with CNG and Config Plugins.
- Source: https://docs.expo.dev/guides/in-app-purchases/
- Source: https://www.revenuecat.com/docs/getting-started/installation/expo
- Tutorial: https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial

Install:
```sh
npx expo install react-native-purchases react-native-purchases-ui expo-dev-client
```

No separate expo plugin needed — autolinking. Do not add to `app.json` plugins.
- Source: https://community.revenuecat.com/sdks-51/package-react-native-purchases-does-not-contain-a-valid-config-plugin-5789?postid=19956

Requirements: React Native >=0.73, Android Kotlin >=1.8.
- Source: https://github.com/RevenueCat/react-native-purchases

Expo Go runs in Preview API Mode only (mocks, no real charge). Use EAS dev build for real testing.
- Source: https://www.revenuecat.com/docs/getting-started/installation/expo

Init once at entry (`_layout.tsx`):
```ts
import Purchases from 'react-native-purchases';

Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID! });
```
- Source: https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial

Grab It is Android-only for now, so `services/revenuecat.ts` reads a single
`EXPO_PUBLIC_REVENUECAT_ANDROID` env var — see `getApiKey()` there.

Supabase identity: `await Purchases.logIn(supabaseUser.id)` after auth, `logOut()` on sign-out.
- Source: https://www-docs.revenuecat.com/docs/customers/identifying-customers

## 3. RevenueCat Ads — tracking, not serving

> This integration works alongside your existing ad implementation. You're not replacing your ad SDK.
- Source: https://www.revenuecat.com/docs/ad-monetization

RevenueCat Ads tracks ad revenue against the same user as subscription data, and grants rewards for rewarded ads (virtual currency or timed Entitlement), verified server-side.
- Source: https://www.revenuecat.com/blog/engineering/monetizing-without-a-paywall-using-ads

Requires ILRD (Impression-Level Revenue Data), AdMob / AppLovin MAX / ironSource / Unity Ads to serve.
Manual tracking on RN: `AdTracker.trackAdDisplayed / trackAdRevenue / trackAdFailedToLoad`.
Requires `react-native-purchases >=10.2.0` for tracking, `>=10.5.0` for rewards.
- Source: https://www.revenuecat.com/docs/ad-monetization

Attribution (Adjust, AppsFlyer, Branch) is separate — RevenueCat is not an attribution network.
- Source: https://www.revenuecat.com/docs/integrations/attribution

## 4. Minimal integration (one purchase)

1. Dashboard: Entitlement `Grabit Pro` -> product `promoted_listing_1` -> Offering (set Current) -> Paywall Publish.
2. Code:
```ts
const { customerInfo } = await Purchases.logIn(supabaseUser.id);
const offerings = await Purchases.getOfferings();
const pkg = offerings.current?.availablePackages[0];
if (pkg) await Purchases.purchasePackage(pkg);
const isPlus = (await Purchases.getCustomerInfo()).entitlements.active['Grabit Pro'] !== undefined;
```
Or prebuilt: `RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'Grabit Pro' })`
- Source: https://www.revenuecat.com/docs/customers/customer-info
- Source: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
3. Add Restore button via `restorePurchases()`.
- Source: https://production-docs.revenuecat.com/docs/getting-started/restoring-purchases

## 5. Keep Grab It free — paid ideas

Principle: do not block free content, use paywalls as dismissable contextual prompts.
- Source: https://www.revenuecat.com/docs/playbooks/guides/freemium

Free forever: listing, claiming, pickup chat.

1. **Grab It Plus (`Grabit Pro`):**
   - Extra listing photos (3 -> 10) — **built**. `FREE_PHOTO_LIMIT` / `PRO_PHOTO_LIMIT` in
     `services/revenuecat.ts`, read via the `useIsGrabitPro()` hook and passed as
     `maxImages` to `PhotoUpload` in `app/(home)/post.tsx` and `app/edit-listing/[id].tsx`.
   - 1 Reserve/week, Plus badge, no sponsor banners — **not built yet**, copy-only on the
     profile screen's Pro card for now.
2. **Promoted Listing (consumable `boost_24h`):** boost to top for 24h. Products can be in an Offering even if not part of any Entitlement.
   - Source: https://www.revenuecat.com/docs/offerings/overview
   - Store `boost_expires_at` in Supabase `listings` after webhook verification.
3. **Reserve Pack (consumable):** 3 active claims free, buy extra reserves. Later earnable via rewarded ad (same check: `isActive`).
   - Pattern: https://www.revenuecat.com/blog/engineering/monetizing-without-a-paywall-using-ads
4. **Tip Jar:** optional $1/$2/$5 after pickup to giver or to keep Grab It free. One-time product, no entitlement.

Server enforcement: RevenueCat webhooks -> Supabase Edge Function -> `profiles.is_plus`, `listings.is_boosted_until`, `claim_credits`. Client `getCustomerInfo()` for instant UI, server as authority.
