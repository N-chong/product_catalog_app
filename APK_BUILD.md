# Building the Android APK

The repository includes `.github/workflows/build-apk.yml`. It runs on every push to `main` and can also be started manually from the GitHub **Actions** tab.

## Add Firebase values to GitHub

For an APK that connects to Firebase, open the GitHub repository and go to **Settings > Secrets and variables > Actions > New repository secret**. Add these six secrets using the same values as the local `.env` file:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

The workflow can still produce an APK without these secrets, but the installed app will show that Firebase is not configured and CRUD operations will not work.

## Download the APK

1. Push the project, including the `android/` directory, to the `main` branch.
2. Open the repository's **Actions** tab.
3. Select **Build Android APK**.
4. Open the successful run.
5. Download `Product-Catalog-Debug-APK` from the **Artifacts** section.
6. Extract the ZIP to get `ProductCatalog-debug.apk`.

Android may ask you to allow installation from unknown sources when installing this debug APK.

## Build locally

With Android Studio and Android SDK installed:

```bash
npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The local APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.
