import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import type { Product, ProductFormData } from '@/interfaces/Product';
import { getErrorMessage } from '@/utils/productUtils';

const COLLECTION_NAME = 'products';
const REQUEST_TIMEOUT_MS = 20_000;

export interface AddProductResult {
  id: string;
  imageUploaded: boolean;
  imageWarning?: string;
}

function requireFirebase() {
  if (!db || !storage) {
    throw new Error(
      'Firebase is not configured in this build. Add all VITE_FIREBASE_* values and rebuild the app.',
    );
  }

  return { database: db, fileStorage: storage };
}

function withTimeout<T>(operation: Promise<T>, action: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${action} timed out. Check your internet connection and Firebase setup.`));
    }, REQUEST_TIMEOUT_MS);
  });

  return Promise.race([operation, timeout]).finally(() => clearTimeout(timeoutId));
}

function toProduct(
  snapshot: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
): Product {
  return { id: snapshot.id, ...snapshot.data() } as Product;
}

function safeFileName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
}

async function uploadProductImage(productId: string, file: File) {
  const { fileStorage } = requireFirebase();
  const path = `products/${productId}/${Date.now()}-${safeFileName(file.name)}`;
  const imageReference = ref(fileStorage, path);
  await withTimeout(uploadBytes(imageReference, file), 'Image upload');

  return {
    imageUrl: await withTimeout(getDownloadURL(imageReference), 'Getting the image URL'),
    imagePath: path,
  };
}

async function removeProductImage(imagePath?: string): Promise<void> {
  if (!imagePath) return;
  const { fileStorage } = requireFirebase();

  try {
    await withTimeout(deleteObject(ref(fileStorage, imagePath)), 'Image deletion');
  } catch (error) {
    const errorCode = (error as { code?: string }).code;
    if (errorCode !== 'storage/object-not-found') throw error;
  }
}

export function subscribeToProducts(
  onProducts: (products: Product[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  try {
    const { database } = requireFirebase();
    const productsQuery = query(
      collection(database, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      productsQuery,
      (snapshot) => onProducts(snapshot.docs.map(toProduct)),
      (error) => onError(error),
    );
  } catch (error) {
    onError(error as Error);
    return () => undefined;
  }
}

export async function getProducts(): Promise<Product[]> {
  const { database } = requireFirebase();
  const snapshot = await withTimeout(
    getDocs(query(collection(database, COLLECTION_NAME), orderBy('createdAt', 'desc'))),
    'Loading products',
  );
  return snapshot.docs.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { database } = requireFirebase();
  const snapshot = await withTimeout(
    getDoc(doc(database, COLLECTION_NAME, id)),
    'Loading the product',
  );
  return snapshot.exists() ? toProduct(snapshot) : null;
}

export async function addProduct(
  data: ProductFormData,
  image?: File | null,
): Promise<AddProductResult> {
  const { database } = requireFirebase();
  const productReference = doc(collection(database, COLLECTION_NAME));

  // Save the required product data first. A Storage failure should not block CREATE.
  await withTimeout(
    setDoc(productReference, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    'Saving the product',
  );

  if (!image) {
    return { id: productReference.id, imageUploaded: false };
  }

  let imageData: { imageUrl: string; imagePath: string } | undefined;

  try {
    imageData = await uploadProductImage(productReference.id, image);
    await withTimeout(
      updateDoc(productReference, {
        ...imageData,
        updatedAt: serverTimestamp(),
      }),
      'Saving the product image',
    );

    return { id: productReference.id, imageUploaded: true };
  } catch (error) {
    if (imageData?.imagePath) {
      await removeProductImage(imageData.imagePath).catch(() => undefined);
    }

    console.warn('Product saved without its image.', error);
    return {
      id: productReference.id,
      imageUploaded: false,
      imageWarning: `Product saved, but the image could not be uploaded. ${getErrorMessage(error)}`,
    };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData,
  newImage?: File | null,
): Promise<void> {
  const { database } = requireFirebase();
  const currentProduct = await getProductById(id);
  if (!currentProduct) throw new Error('Product not found.');

  let newImageData: { imageUrl: string; imagePath: string } | undefined;

  try {
    if (newImage) newImageData = await uploadProductImage(id, newImage);

    await withTimeout(
      updateDoc(doc(database, COLLECTION_NAME, id), {
        ...data,
        ...(newImageData ?? {}),
        updatedAt: serverTimestamp(),
      }),
      'Updating the product',
    );
  } catch (error) {
    if (newImageData?.imagePath) {
      await removeProductImage(newImageData.imagePath).catch(() => undefined);
    }
    throw error;
  }

  if (newImageData && currentProduct.imagePath) {
    await removeProductImage(currentProduct.imagePath).catch((error) => {
      console.warn('The old product image could not be removed.', error);
    });
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { database } = requireFirebase();
  const product = await getProductById(id);
  if (!product) throw new Error('Product not found.');

  await withTimeout(deleteDoc(doc(database, COLLECTION_NAME, id)), 'Deleting the product');
  await removeProductImage(product.imagePath).catch((error) => {
    console.warn('The product was deleted, but its image could not be removed.', error);
  });
}
