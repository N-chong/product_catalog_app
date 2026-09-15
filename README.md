# Product Catalog App

A simple mobile-first product catalog built with Ionic Vue, Vue 3, TypeScript, Cloud Firestore, and Firebase Storage. It demonstrates CRUD operations, image uploads, live dashboard totals, product search, category filtering, and automatic stock monitoring.

## Features

- Dashboard totals for products, categories, low stock, and out-of-stock items
- Real-time product list from the Firestore `products` collection
- Add and edit forms with validation and image previews
- Firebase Storage image upload, replacement, and deletion
- Case-insensitive product-name search and category filtering
- Automatic stock status: out of stock at 0, low stock at 1–5, and in stock above 5
- Product details with timestamps and a confirmed delete action
- Responsive Ionic UI for mobile and desktop browsers

## Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web app to that Firebase project.
3. Open **Build > Firestore Database**, create the database, and choose the region closest to you.
4. Open **Build > Storage** and enable Cloud Storage.
5. Copy `.env.example` to a new file named `.env`.
6. Copy the values from **Project settings > Your apps > SDK setup and configuration** into `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

7. Publish the included `firestore.rules` and `storage.rules` in the matching Firebase Console Rules tabs. You can also deploy them with the Firebase CLI after connecting this folder to your project:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,storage
```

The included rules intentionally allow public access because this is a no-login classroom demonstration. Do not use these rules for a production application.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The app will display a clear setup message instead of crashing if `.env` is missing.

## Quality checks

```bash
npm run build
npm run test:unit -- --run
```

## Main code structure

```text
src/
├── components/       Reusable navigation, cards, empty state, and product form
├── firebase/         Firebase initialization from environment variables
├── interfaces/       Product TypeScript types and category list
├── services/         All Firestore and Storage CRUD operations
├── utils/            Currency, date, error, and stock helpers
└── views/            Dashboard, catalog, add, details, and edit pages
```

## Suggested demonstration

1. Show the dashboard totals.
2. Open Products, search by name, and filter by category.
3. Add a product with an image.
4. Open its details, then edit the quantity to 5 or 0.
5. Return to the dashboard to show the live stock totals changing.
6. Delete the product and confirm that it disappears from Firestore and the catalog.
