# HappyTrails Sync Demo

Tech demo for signing in with Google and uploading photos to Google Drive. Built with [Expo](https://expo.dev).

## Get started

This app uses a native Google sign-in module (`react-native-nitro-google-signin`), so it does **not** run in Expo Go. You need a development build.

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure: `.env` holds `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. To use your own value, put it in `.env.local`, which git ignores.

3. Create and install a development build on an Android device, using either option:

   ```bash
   npx eas-cli@latest build --profile development --platform android
   # or locally:
   npx expo run:android
   ```

4. Start the dev server and open the app from the dev build:

   ```bash
   npx expo start
   ```

## Checks

```bash
npx expo lint
npx tsc --noEmit
npx expo-doctor
```
