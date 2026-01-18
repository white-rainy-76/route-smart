# Env vars

Do **not** commit secrets/keys into the repo.

## Local development

Create a `.env` (not committed) with:

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...`
- `EXPO_PUBLIC_API=...`
- `EXPO_PUBLIC_API_KEY=...` (if required by your backend)

## EAS Production / TestFlight

Store the values in **EAS Secrets** so they are injected at build time:

```bash
eas secret:create --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "<YOUR_KEY>"
eas secret:create --name EXPO_PUBLIC_API --value "<YOUR_API_BASE_URL>"
eas secret:create --name EXPO_PUBLIC_API_KEY --value "<YOUR_API_KEY>"
```

Then rebuild with:

```bash
eas build -p ios --profile production
```
