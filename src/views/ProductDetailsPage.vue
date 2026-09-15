<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/products" /></ion-buttons>
        <ion-title>Product Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container details-page">
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent" />
          <p>Loading product...</p>
        </div>

        <empty-state
          v-else-if="!product"
          :icon="warningOutline"
          title="Product not available"
          :message="errorMessage || 'This product may have been removed.'"
          button-text="Back to products"
          button-link="/products"
        />

        <template v-else>
          <section class="detail-layout">
            <div class="detail-image">
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
              <div v-else class="image-placeholder">
                <ion-icon :icon="imageOutline" />
                <span>No product image</span>
              </div>
              <span class="image-accent" aria-hidden="true" />
            </div>

            <article class="product-record">
              <p class="category">{{ product.category }}</p>
              <h1>{{ product.name }}</h1>
              <p class="price">{{ formatCurrency(product.price) }}</p>

              <div class="availability-line">
                <ion-badge :color="getStockColor(product.quantity)">
                  {{ getStockStatus(product.quantity) }}
                </ion-badge>
                <span>{{ product.quantity }} {{ product.quantity === 1 ? 'unit' : 'units' }} available</span>
              </div>

              <section class="record-section">
                <p class="section-label">Description</p>
                <p class="description">{{ product.description }}</p>
              </section>

              <section class="record-section">
                <p class="section-label violet-label">Product information</p>
                <dl class="information-list">
                  <div><dt>Category</dt><dd>{{ product.category }}</dd></div>
                  <div><dt>Quantity</dt><dd>{{ product.quantity }}</dd></div>
                  <div><dt>Created</dt><dd>{{ formatProductDate(product.createdAt) }}</dd></div>
                  <div><dt>Updated</dt><dd>{{ formatProductDate(product.updatedAt) }}</dd></div>
                  <div><dt>Product ID</dt><dd class="product-id">{{ product.id }}</dd></div>
                </dl>
              </section>

              <div class="action-buttons">
                <ion-button :router-link="`/products/${product.id}/edit`">
                  <ion-icon slot="start" :icon="createOutline" /> Edit Product
                </ion-button>
                <ion-button fill="clear" color="danger" :disabled="deleting" @click="confirmDelete">
                  <ion-spinner v-if="deleting" name="crescent" />
                  <ion-icon v-else slot="start" :icon="trashOutline" />
                  {{ deleting ? 'Deleting...' : 'Delete Product' }}
                </ion-button>
              </div>
            </article>
          </section>

          <div v-if="errorMessage" class="notice error-notice" role="alert">
            <ion-icon :icon="warningOutline" />
            <div><strong>Action could not be completed</strong><span>{{ errorMessage }}</span></div>
          </div>
        </template>
      </main>
    </ion-content>

    <bottom-navigation />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  alertController,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue';
import { createOutline, imageOutline, trashOutline, warningOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyState from '@/components/EmptyState.vue';
import type { Product } from '@/interfaces/Product';
import { deleteProduct, getProductById } from '@/services/productService';
import {
  formatCurrency,
  formatProductDate,
  getErrorMessage,
  getStockColor,
  getStockStatus,
} from '@/utils/productUtils';

const route = useRoute();
const router = useRouter();
const product = ref<Product | null>(null);
const loading = ref(true);
const deleting = ref(false);
const errorMessage = ref('');

async function loadProduct() {
  loading.value = true;
  errorMessage.value = '';
  try {
    product.value = await getProductById(String(route.params.id));
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    product.value = null;
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  const alert = await alertController.create({
    header: 'Delete product?',
    message: `${product.value?.name ?? 'This product'} will be permanently removed from your catalog.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => { void handleDelete(); },
      },
    ],
  });
  await alert.present();
}

async function handleDelete() {
  if (!product.value?.id || deleting.value) return;
  deleting.value = true;
  errorMessage.value = '';

  try {
    await deleteProduct(product.value.id);
    const toast = await toastController.create({
      message: 'Product deleted successfully.',
      duration: 2200,
      color: 'success',
      position: 'top',
    });
    await toast.present();
    await router.replace('/products');
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    deleting.value = false;
  }
}

onIonViewWillEnter(loadProduct);
</script>

<style scoped>
.details-page {
  max-width: 1040px;
  padding-top: clamp(27px, 5vw, 48px);
  padding-bottom: 52px;
}

.loading-state {
  display: grid;
  place-items: center;
  min-height: 55vh;
  color: var(--app-muted);
}

.loading-state ion-spinner {
  color: var(--ion-color-primary);
}

.loading-state p {
  margin-top: -100px;
  font-size: 0.82rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1.05fr);
  gap: clamp(35px, 7vw, 78px);
  align-items: start;
}

.detail-image {
  position: sticky;
  top: 24px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border: 1px solid var(--app-border-strong);
  background: #ffffff;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: grid;
  place-items: center;
  align-content: center;
  height: 100%;
  color: #8792a2;
  background: var(--app-primary-soft);
}

.image-placeholder ion-icon {
  margin-bottom: 9px;
  font-size: 4.5rem;
}

.image-placeholder span {
  font-size: 0.74rem;
  font-weight: 700;
}

.image-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  height: 6px;
  background: var(--app-violet);
}

.product-record {
  min-width: 0;
}

.category {
  margin: 5px 0 10px;
  color: var(--app-violet);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.product-record h1 {
  margin: 0;
  color: var(--app-ink);
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  font-weight: 780;
  letter-spacing: -0.055em;
  line-height: 1.02;
}

.price {
  margin: 15px 0 18px;
  color: var(--ion-color-primary);
  font-size: 1.65rem;
  font-weight: 800;
}

.availability-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 0;
  border-top: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
}

.availability-line ion-badge {
  padding: 5px 7px;
  border-radius: 4px;
  font-size: 0.58rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.availability-line span {
  color: var(--app-muted);
  font-size: 0.76rem;
}

.record-section {
  padding: 27px 0;
  border-bottom: 1px solid var(--app-border-strong);
}

.section-label {
  margin: 0 0 13px;
  color: var(--ion-color-primary);
  font-size: 0.67rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.violet-label {
  color: var(--app-violet);
}

.description {
  margin: 0;
  color: var(--app-ink-soft);
  font-size: 0.92rem;
  line-height: 1.75;
  white-space: pre-line;
}

.information-list {
  margin: 0;
}

.information-list div {
  display: grid;
  grid-template-columns: minmax(110px, 0.7fr) minmax(0, 1.3fr);
  gap: 20px;
  padding: 10px 0;
  border-bottom: 1px solid var(--app-border);
}

.information-list div:last-child {
  border-bottom: 0;
}

.information-list dt,
.information-list dd {
  margin: 0;
  font-size: 0.76rem;
}

.information-list dt {
  color: var(--app-muted);
}

.information-list dd {
  overflow: hidden;
  color: var(--app-ink);
  font-weight: 700;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.action-buttons {
  display: grid;
  gap: 7px;
  padding-top: 25px;
}

.action-buttons ion-button {
  --border-radius: 7px;
  --box-shadow: none;
  min-height: 49px;
  margin: 0;
  font-size: 0.82rem;
}

.action-buttons ion-button:first-child {
  --background: var(--ion-color-primary);
}

.action-buttons ion-button:last-child {
  justify-self: start;
}

.action-buttons ion-spinner {
  width: 17px;
  margin-right: 7px;
}

@media (max-width: 760px) {
  .detail-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .detail-image {
    position: relative;
    top: 0;
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 420px) {
  .product-record h1 {
    font-size: 2.35rem;
  }

  .information-list div {
    grid-template-columns: 92px minmax(0, 1fr);
  }
}
</style>
