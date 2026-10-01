import Constants, { ExecutionEnvironment } from 'expo-constants';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// Lookup key in RevenueCat dashboard -> Entitlements.
// Must match exactly (case + spaces).
export const GRABIT_ENTITLEMENT_ID = 'Grabit Pro';

// Listing photo limits gated by the Grab It Pro entitlement.
export const FREE_PHOTO_LIMIT = 3;
export const PRO_PHOTO_LIMIT = 10;

// Test Store key from dashboard. Only valid outside real store builds —
// RevenueCat crashes/rejects it if it ever ends up in a release build.
const FALLBACK_TEST_KEY = 'test_oSsYpLBfFYXXoLzQsWSDZxiVLvc';

// True when running inside Expo Go. Native paywall UI has no effect here
// (Preview API mode) — real purchases need an EAS dev build.
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function getApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID;
  if (key) return key;
  if (__DEV__ || isExpoGo()) return FALLBACK_TEST_KEY;
  console.error(
    '[RevenueCat] EXPO_PUBLIC_REVENUECAT_ANDROID is missing in a release build — refusing to fall back to the Test Store key.',
  );
  return null;
}

let configured = false;

export function configureRevenueCat() {
  if (configured) return;
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[RevenueCat] No API key set');
    return;
  }
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
    configured = true;
  } catch (e) {
    console.warn('[RevenueCat] configure failed', e);
  }
}

export async function loginRevenueCat(appUserId: string) {
  try {
    await Purchases.logIn(appUserId);
  } catch (e) {
    console.warn('[RevenueCat] logIn failed', e);
  }
}

export async function logoutRevenueCat() {
  try {
    // logOut() throws if the current user is already anonymous (e.g. a
    // cold start where loginRevenueCat() was never called).
    if (await Purchases.isAnonymous()) return;
    await Purchases.logOut();
  } catch (e) {
    console.warn('[RevenueCat] logOut failed', e);
  }
}

export async function isGrabitPro(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active[GRABIT_ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}

// Presents dashboard paywall for current offering. Returns true if purchased/restored.
// Falls back to direct package purchase when native paywall UI is unavailable
// (Expo Go Preview mode), so the flow still completes in test builds.
export async function presentGrabitPaywall(): Promise<boolean> {
  try {
    const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
      default:
        break;
    }
  } catch (e) {
    console.warn('[RevenueCat] native paywall failed, trying fallback', e);
  }
  return purchaseFallbackPackage();
}

async function purchaseFallbackPackage(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.monthly ??
      offerings.current?.availablePackages[0];
    if (!pkg) {
      console.warn('[RevenueCat] no packages in current offering');
      return false;
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return (
      typeof customerInfo.entitlements.active[GRABIT_ENTITLEMENT_ID] !==
      'undefined'
    );
  } catch (e: any) {
    if (e?.userCancelled) return false;
    console.warn('[RevenueCat] fallback purchase failed', e);
    return false;
  }
}

// Shows RevenueCat's Customer Center: current plan, active entitlements,
// cancel/manage options. This is what "Manage" should open for Pro users
// (presentGrabitPaywall() would just re-show the purchase paywall).
export async function manageGrabitSubscription(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (e) {
    console.warn('[RevenueCat] presentCustomerCenter failed', e);
  }
}

export async function restoreGrabitPurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return typeof info.entitlements.active[GRABIT_ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}
