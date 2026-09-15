# Product Catalog App — Project Explanation and Defense Guide

## 1. Short project introduction

The Product Catalog App is a mobile-first application for recording and monitoring products. It was created with Ionic Vue, Vue 3, TypeScript, Firebase Cloud Firestore, and Firebase Storage.

The main purpose is to demonstrate the four CRUD operations:

- **Create:** Add a product.
- **Read:** Display products and their details.
- **Update:** Edit an existing product.
- **Delete:** Remove a product after confirmation.

The app also includes image uploads, product search, category filtering, stock monitoring, a real-time dashboard, validation, error messages, and an Android APK build workflow.

The scope is intentionally simple. It does not include accounts, shopping carts, checkout, payments, or orders because it is a catalog and inventory demonstration rather than an e-commerce system.

## 2. Sample presentation script

You can use this as your opening explanation:

> Good day. Our project is a Product Catalog mobile application built using Ionic Vue, Vue 3, TypeScript, and Firebase. Its main objective is to demonstrate CRUD operations using Cloud Firestore and product-image management using Firebase Storage. Users can add, view, edit, delete, search, and filter products. The application automatically calculates stock status from the product quantity and displays live inventory statistics on the dashboard. We used reusable components and a separate Firebase service to keep the code organized and easy to maintain. The application is responsive in a browser and can also be built as an Android APK using Capacitor and GitHub Actions.

## 3. Technologies used

### Ionic Framework

Ionic provides mobile-friendly interface components such as toolbars, cards, inputs, buttons, alerts, badges, toasts, spinners, and bottom navigation. It makes the web application look and behave like a mobile application.

### Vue 3

Vue controls the user interface and application state. The project uses the Composition API and `<script setup lang="ts">` to keep components readable.

### TypeScript

TypeScript adds types to JavaScript. The `Product` interface defines the expected structure of every product and helps catch mistakes during development.

### Firebase Cloud Firestore

Firestore is the cloud database. Products are stored as documents inside a collection named `products`. Firestore-generated IDs uniquely identify each product.

### Firebase Storage

Firebase Storage stores the actual image files. Firestore stores only the image URL and storage path, which keeps product documents small.

### Vue Router

Vue Router connects the Dashboard, Product Catalog, Add Product, Product Details, and Edit Product pages.

### Capacitor Android

Capacitor packages the Ionic web application inside a native Android project. Gradle then builds that project into an APK.

### GitHub Actions

The workflow automatically installs dependencies, checks the code, builds the Ionic application, synchronizes Capacitor, builds the Android APK, and uploads it as a downloadable artifact.

## 4. Main application features

### Dashboard

The dashboard displays:

- Total products
- Total categories
- Low-stock products
- Out-of-stock products
- Recently added products

The values are calculated from the products received from Firestore. They are not manually stored as separate totals.

### Product Catalog

The catalog displays product cards containing the image, name, category, price in Philippine pesos, quantity, and stock status. Selecting a card opens its details.

### Search and category filtering

Search is case-insensitive and checks the product name. The category selector can show all categories or one selected category. Both filters work together.

For example, selecting `Electronics` and searching for `mouse` displays only electronic products whose names contain `mouse`.

### Add Product

The add form accepts:

- Product name
- Category
- Price
- Quantity
- Description
- Optional image

The form prevents invalid data and disables its submit button while saving to prevent accidental duplicate submissions.

The product data is saved first. If the optional image upload fails, the product is still created and the app displays a warning. This improves reliability when Firebase Storage is unavailable.

### Product Details

The details page shows all product information, including the creation date, last update date, stock status, and Firestore document ID. It also provides Edit and Delete buttons.

### Edit Product

The edit form loads the current values automatically. Saving updates the Firestore document and sets a new server-generated `updatedAt` timestamp. If the image is replaced, the old unused Storage image is removed.

### Delete Product

The app displays an Ionic confirmation alert before deletion. After confirmation, it deletes the Firestore document and attempts to remove its associated Storage image.

### Stock monitoring

Stock status is calculated from quantity:

```text
Quantity = 0   → Out of Stock
Quantity 1–5   → Low Stock
Quantity > 5   → In Stock
```

The status is calculated instead of stored in Firebase. This avoids inconsistent data. For example, a quantity of zero can never accidentally be labeled “In Stock.”

### Loading and feedback

The application provides:

- Skeleton cards while product lists load
- Spinners while saving, updating, or deleting
- Toast messages after successful operations
- Visible Firebase error messages
- Empty states when there are no products or search results
- A 20-second timeout for Firebase requests

## 5. Product data structure

Each Firestore product document follows this structure:

```typescript
interface Product {
  id?: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  quantity: number;
  imageUrl?: string;
  imagePath?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}
```

Example Firestore structure:

```text
products
└── automaticallyGeneratedDocumentId
    ├── name: "Wireless Mouse"
    ├── category: "Electronics"
    ├── price: 599
    ├── description: "Wireless ergonomic mouse"
    ├── quantity: 10
    ├── imageUrl: "https://..."
    ├── imagePath: "products/documentId/image.jpg"
    ├── createdAt: server timestamp
    └── updatedAt: server timestamp
```

## 6. How data moves through the application

```text
User interface
    ↓
Vue page or reusable component
    ↓
productService.ts
    ↓
Cloud Firestore and Firebase Storage
    ↓
Real-time listener updates the dashboard and catalog
```

Vue pages do not contain direct Firebase implementation details. They call functions in `productService.ts`. This separation makes the application easier to explain, test, and maintain.

## 7. Where CRUD is implemented

### Create

`AddProductPage.vue` receives validated data from `ProductForm.vue` and calls `addProduct()` in `productService.ts`.

### Read

The Dashboard and Product Catalog use `subscribeToProducts()`, which uses Firestore's `onSnapshot()` real-time listener. Product Details and Edit use `getProductById()`.

### Update

`EditProductPage.vue` calls `updateProduct()`. The service updates the selected Firestore document and its `updatedAt` timestamp.

### Delete

`ProductDetailsPage.vue` displays the confirmation alert and calls `deleteProduct()` after the user confirms.

## 8. Validation rules

The client validates that:

- Product name is required and limited to 80 characters.
- Category is required.
- Price is a number and cannot be negative.
- Quantity is a whole number and cannot be negative.
- Description is required and limited to 500 characters.
- Images must be JPG, PNG, or WebP.
- Images must be smaller than 5 MB.

Firestore and Storage rules provide additional server-side validation. Client validation improves usability, while server rules protect the backend from invalid requests.

## 9. Security explanation

Firebase configuration values identify the Firebase project, but they do not replace security rules. Firestore and Storage rules decide which operations are allowed.

This school project does not include authentication, so its included rules permit public catalog access while validating the data structure and image type. This is acceptable only for classroom demonstration data. A production system should add authentication and restrict writes to authorized users.

The local `.env` file is excluded from Git. GitHub Actions receives Firebase values through repository secrets.

## 10. What was added to the Ionic starter

### Application pages

- `DashboardPage.vue`
- `ProductCatalogPage.vue`
- `AddProductPage.vue`
- `ProductDetailsPage.vue`
- `EditProductPage.vue`

### Reusable components

- `ProductForm.vue` for adding and editing
- `ProductCard.vue` for catalog cards
- `BottomNavigation.vue` for main navigation
- `EmptyState.vue` for empty results

### Firebase and application logic

- `firebase/config.ts` for Firebase initialization
- `services/productService.ts` for Firestore and Storage operations
- `interfaces/Product.ts` for product types and categories
- `utils/productUtils.ts` for stock, price, date, and error helpers
- `firestore.rules` and `storage.rules`
- `.env.example` for Firebase configuration

### Android and automation

- Capacitor Android dependency
- Native `android/` project
- Android light theme and internet permission
- `.github/workflows/build-apk.yml`
- Firebase environment values supplied through GitHub Secrets

### Quality improvements

- Responsive mobile and browser layout
- High-contrast light theme
- Always-visible form labels
- Loading and error feedback
- Unit tests for stock logic and Firebase error messages
- ESLint and TypeScript production-build validation

## 11. Suggested live demonstration

1. Open the Dashboard and explain the four totals.
2. Open Products and show the catalog cards.
3. Search for part of a product name.
4. Select a category while keeping the search active.
5. Open Add Product and intentionally submit an empty form to demonstrate validation.
6. Enter valid details and select an image.
7. Submit and show the success toast.
8. Open the new product's details.
9. Edit its quantity to `5` and show the Low Stock badge.
10. Edit its quantity to `0` and show the Out of Stock badge.
11. Return to the Dashboard and show the automatic total change.
12. Delete the product and confirm the deletion alert.
13. Show that the product disappears from the catalog and Firestore.

Use demo data only. Test the Firebase connection and image upload before presenting.

## 12. Possible professor questions and sample answers

### 1. What problem does the application solve?

It provides a simple way to organize products, monitor quantity, and identify low-stock or out-of-stock items without using a complicated inventory system.

### 2. Why did you use Ionic Vue?

Ionic provides mobile-ready components, while Vue provides a simple reactive programming model. The same code can run in a browser and be packaged as an Android app using Capacitor.

### 3. Why did you use Firebase?

Firebase provides a hosted database and file storage without requiring a custom backend server. It is appropriate for a small school project and clearly demonstrates cloud CRUD operations.

### 4. What is CRUD in your application?

Create is adding a product, Read is displaying the catalog and details, Update is editing the product, and Delete is removing it after confirmation.

### 5. Why is the stock status not stored in Firestore?

It can be calculated directly from quantity. Calculating it avoids duplicated or contradictory data.

### 6. How does the dashboard update automatically?

The dashboard uses Firestore's `onSnapshot()` listener. When a product changes, Firestore sends the new list and Vue recalculates the totals.

### 7. What is the difference between Firestore and Firebase Storage?

Firestore stores structured product information. Storage stores larger binary files such as images. Firestore contains the URL and path that point to the Storage file.

### 8. Why use server timestamps?

Server timestamps use Firebase's clock instead of the phone's clock. This makes creation and update dates more reliable and consistent.

### 9. Why use Firestore-generated IDs?

Generated IDs are unique and remove the need to manually manage product ID numbers.

### 10. How do search and filtering work together?

A computed Vue value checks both conditions for every product. The name must match the search text and the category must match the selected category unless All Categories is selected.

### 11. How do you prevent invalid data?

The reusable form validates required text, price, whole-number quantity, image format, and image size. Firebase rules also validate data on the server.

### 12. How do you prevent duplicate submissions?

The page checks a `submitting` state and disables the submit button while a Firebase operation is active.

### 13. Why did you create a product service?

The service keeps Firebase operations out of the pages. Pages handle presentation, while the service handles database and Storage logic.

### 14. Why did you create a reusable product form?

Add and Edit need almost identical fields and validation. Reusing one form reduces duplicate code and ensures consistent behavior.

### 15. What happens if an image upload fails?

The product data is saved first. The app then displays a warning and keeps the product with a placeholder image. This prevents an optional image failure from blocking the main Create operation.

### 16. What happens when an image is replaced?

The new image is uploaded, the Firestore document is updated, and the service attempts to remove the old image so unused files do not accumulate.

### 17. How is deletion protected from accidents?

The app opens an Ionic confirmation alert. The delete service is called only when the user selects Delete.

### 18. How are Firebase errors handled?

Errors are caught and translated into understandable messages. The app explains common problems such as disabled Firestore, unpublished rules, unavailable Storage, or a network timeout.

### 19. Is the app responsive?

Yes. CSS grid and media queries adjust the number of columns, spacing, image size, and form layout for phones and larger browser screens.

### 20. Why does the app use a fixed light theme?

The original automatic dark theme could create low contrast between white cards and dark-mode Ionic labels. A consistent high-contrast light theme keeps text and labels readable on different Android devices.

### 21. How is the APK produced?

Vite builds the Vue application into the `dist` directory. Capacitor copies those assets into the Android project. Gradle builds `app-debug.apk`, and GitHub Actions uploads it as an artifact.

### 22. What is the difference between a debug and release APK?

A debug APK is intended for development and demonstration and uses a debug signing certificate. A release APK uses a protected, stable release key and is suitable for formal distribution.

### 23. Are the Firebase API values secret?

They identify the Firebase app but do not secure the database by themselves. Security comes from Firestore rules, Storage rules, authentication, and optionally App Check. Repository secrets prevent accidental exposure in the workflow configuration.

### 24. What are the limitations of the current system?

It has no authentication, uses public demo rules, depends on an internet connection for confirmed cloud writes, and is not a complete inventory or e-commerce platform. Firebase Storage also requires the Firebase Blaze plan.

### 25. What would you improve in a production version?

I would add authentication and role-based access, private security rules, Firebase App Check, offline status indicators, stable release signing, image compression, pagination, automated end-to-end tests, and backup or audit logging.

## 13. Short closing statement

> In summary, the application successfully demonstrates a complete cloud-based CRUD workflow in a mobile-friendly interface. Its code is separated into pages, reusable components, utilities, interfaces, and Firebase services. The project focuses on reliability and clear demonstration: stock is calculated automatically, dashboard values update in real time, forms validate input, and users receive feedback for every important operation.
