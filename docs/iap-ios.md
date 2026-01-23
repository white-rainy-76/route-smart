# iOS subscriptions (IAP) — production-grade checklist

This project uses **Expo + EAS** and **`react-native-iap` (StoreKit 2)**.

## App Store Connect setup

- Create an **auto‑renewable subscription**.
- Ensure **Product ID** matches exactly:
  - `us.roadsmart.app.sub.monthly`
- Put it into a **Subscription Group** (required).
- Fill **localization**, **pricing**, and (if used) **intro offer / free trial**.
- Complete App Store Connect “Agreements, Tax, and Banking”.

## App configuration

- Bundle ID must match your app:
  - `us.roadsmart.app` (see `app.config.js`)
- Use EAS Dev Build / EAS Production build (IAP won’t work in Expo Go).

## EAS env vars (important for release stability)

This app uses Google Maps provider on iOS when a key is present.
Make sure your EAS build has:

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- `EXPO_PUBLIC_API` (your backend base URL, if required)

If the key is missing in a release build, iOS may crash when initializing Google Maps.

See `docs/env.example.md` for the recommended way to set these via EAS Secrets.

## Client-side flow (already implemented)

- Paywall screen: `src/app/(utils)/subscription.tsx`
  - Fetch products: `fetchProducts({ type: 'subs' })`
  - Start purchase: `requestPurchase({ type: 'subs' })`
  - Finish transaction: `finishTransaction({ purchase })`
  - Restore: `restorePurchases()`
- Global status check (startup): `src/shared/contexts/app-context.tsx`
  - `hasActiveSubscriptions([productId])`

## Testing (Sandbox)

- Create Sandbox Tester in App Store Connect.
- On device: Settings → App Store → Sandbox Account (or sign-in prompt on purchase).
- Build and install a dev build:
  - `eas build -p ios --profile development`

## “Highest level” production architecture (recommended)

Client-only checks are convenient, but for “highest level” you should add:

- **Server-side entitlement**: store active subscription status per user.
- **App Store Server API**: validate transactions / fetch subscription state server-side.
- **App Store Server Notifications v2**: receive renewals, cancellations, refunds, billing issues.

Minimal approach:

- Client sends **transaction JWS / transaction id** to your backend on purchase.
- Backend verifies and updates user entitlement.
- App reads entitlement from backend on launch (with caching).
