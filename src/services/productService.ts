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

const COLLECTION_NAME = 'products';

function requireFirebase() {
  if (!db || !storage) {
    throw new Error('Firebase is not configured. Add your Firebase values to a .env file.');
  }

  return { database: db, fileStorage: storage };
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
  await uploadBytes(imageReference, file);

  return {
    imageUrl: await getDownloadURL(imageReference),
    imagePath: path,
  };
}

async function removeProductImage(imagePath?: string): Promise<void> {
  if (!imagePath) return;
  const { fileStorage } = requireFirebase();

  try {
    await deleteObject(ref(fileStorage, imagePath));
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
  const snapshot = await getDocs(
    query(collection(database, COLLECTION_NAME), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { database } = requireFirebase();
  const snapshot = await getDoc(doc(database, COLLECTION_NAME, id));
  return snapshot.exists() ? toProduct(snapshot) : null;
}

export async function addProduct(data: ProductFormData, image?: File | null): Promise<string> {
  const { database } = requireFirebase();
  const productReference = doc(collection(database, COLLECTION_NAME));
  let imageData: { imageUrl: string; imagePath: string } | undefined;

  try {
    if (image) imageData = await uploadProductImage(productReference.id, image);

    await setDoc(productReference, {
      ...data,
      ...(imageData ?? {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return productReference.id;
  } catch (error) {
    if (imageData?.imagePath) await removeProductImage(imageData.imagePath).catch(() => undefined);
    throw error;
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

    await updateDoc(doc(database, COLLECTION_NAME, id), {
      ...data,
      ...(newImageData ?? {}),
      updatedAt: serverTimestamp(),
    });
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

  await deleteDoc(doc(database, COLLECTION_NAME, id));
  await removeProductImage(product.imagePath).catch((error) => {
    console.warn('The product was deleted, but its image could not be removed.', error);
  });
}
