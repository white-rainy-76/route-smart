# Backend validation contract (Apple subscriptions)

## What the app should send (iOS)

Best practice for StoreKit 2 is to send a **transaction JWS** to your backend.

You can get it from `react-native-iap` in two ways:

- `purchase.purchaseToken` (on iOS this is a **JWS**)
- or `getTransactionJwsIOS(productId)` as a fallback

Recommended payload (see frontend stub: `src/services/subscription/subscription.service.ts`):

- `productId`: string
- `transactionJws`: string (signedTransactionInfo JWS)
- `transactionId`: string (optional, helpful for idempotency/debug)
- `originalTransactionId`: string (optional, helps link renewals)

## What backend should do (production)

- Verify the JWS and derive entitlement.
- Persist entitlement per user (active + expiry + originalTransactionId).
- Keep entitlement up-to-date via **App Store Server Notifications v2**.

Implementation options:

- **App Store Server API** (recommended): use Apple private key (.p8) to call endpoints and validate transaction/subscription status.
- Or validate JWS signature using Apple keys + read claims (still usually combined with server API for lifecycle).

## What backend should return to the app

Return a stable, canonical **entitlement** object:

- `isActive`: boolean
- `productId`: string (optional)
- `expiresAt`: ISO string (optional)
- `originalTransactionId`: string (optional)
- `environment`: `"Sandbox" | "Production"` (optional)

Example:

```json
{
  "entitlement": {
    "isActive": true,
    "productId": "us.roadsmart.app.sub.test.monthly",
    "expiresAt": "2026-02-15T10:00:00.000Z",
    "originalTransactionId": "2000001234567890",
    "environment": "Sandbox"
  }
}
```

## appAccountToken (implemented)

The app now sends `appAccountToken` (UUID) with every purchase request to strongly bind a transaction to a user.

### How it works

1. **App generates deterministic UUID** from userId using SHA-256 hash
2. **UUID is passed to Apple** during `requestPurchase({ appAccountToken })`
3. **Apple stores it** in the signed transaction (JWS)
4. **App sends it to backend** in `verifyAppleSubscription` payload
5. **Apple Server Notifications v2** also include this token

### Backend should

- Verify `appAccountToken` matches expected UUID for the user
- Use it to link webhook events (renewals, cancellations) to users
- The token is deterministic: same userId always produces the same UUID

### Payload now includes

```json
{
  "productId": "us.roadsmart.app.sub.test.monthly",
  "transactionJws": "...",
  "transactionId": "...",
  "originalTransactionId": "...",
  "appAccountToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Implementation details

- Token generation: `src/shared/lib/iap/app-account-token.ts`
- Uses `expo-crypto` SHA-256 to create deterministic UUID from `roadsmart:{userId}`
