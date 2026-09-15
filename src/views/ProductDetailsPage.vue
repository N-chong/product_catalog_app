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
          <section class="product-overview">
            <div class="detail-image">
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
              <div v-else class="image-placeholder"><ion-icon :icon="imageOutline" /></div>
            </div>

            <div class="detail-copy">
              <div class="badge-row">
                <ion-chip color="primary">{{ product.category }}</ion-chip>
                <ion-badge :color="getStockColor(product.quantity)">
                  {{ getStockStatus(product.quantity) }}
                </ion-badge>
              </div>
              <h1>{{ product.name }}</h1>
              <p class="price">{{ formatCurrency(product.price) }}</p>
              <p class="description">{{ product.description }}</p>

              <div class="quantity-panel">
                <div class="quantity-icon"><ion-icon :icon="layersOutline" /></div>
                <div>
                  <span>Available quantity</span>
                  <strong>{{ product.quantity }} {{ product.quantity === 1 ? 'item' : 'items' }}</strong>
                </div>
              </div>

              <div class="action-buttons">
                <ion-button :router-link="`/products/${product.id}/edit`" shape="round">
                  <ion-icon slot="start" :icon="createOutline" /> Edit Product
                </ion-button>
                <ion-button fill="outline" color="danger" shape="round" :disabled="deleting" @click="confirmDelete">
                  <ion-spinner v-if="deleting" name="crescent" />
                  <ion-icon v-else slot="start" :icon="trashOutline" />
                  {{ deleting ? 'Deleting...' : 'Delete' }}
                </ion-button>
              </div>
            </div>
          </section>

          <section class="record-card">
            <div class="record-heading">
              <div class="record-icon"><ion-icon :icon="timeOutline" /></div>
              <div><p class="eyebrow">Record history</p><h2>Product timeline</h2></div>
            </div>
            <div class="timeline-grid">
              <div>
                <span>Date created</span>
                <strong>{{ formatProductDate(product.createdAt) }}</strong>
              </div>
              <div>
                <span>Last updated</span>
                <strong>{{ formatProductDate(product.updatedAt) }}</strong>
              </div>
              <div>
                <span>Product ID</span>
                <strong class="product-id">{{ product.id }}</strong>
              </div>
            </div>
          </section>

          <div v-if="errorMessage" class="notice error-notice">
            <ion-icon :icon="warningOutline" />
            <div><strong>Action could not be completed</strong><span>{{ errorMessage }}</span></div>
          </div>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
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
import {
  createOutline,
  imageOutline,
  layersOutline,
  timeOutline,
  trashOutline,
  warningOutline,
} from 'ionicons/icons';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
    message: 'Are you sure you want to delete this product? This action cannot be undone.',
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
.details-page { max-width: 980px; padding-top: 28px; padding-bottom: 45px; }
.loading-state { display: grid; place-items: center; min-height: 55vh; color: var(--app-muted); }
.loading-state ion-spinner { color: var(--ion-color-primary); }
.loading-state p { margin-top: -100px; font-size: 0.85rem; }
.product-overview {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(27px, 6vw, 58px);
  align-items: center;
  padding: clamp(20px, 4vw, 38px);
  border: 1px solid var(--app-border);
  border-radius: 28px;
  background: #fff;
  box-shadow: var(--app-card-shadow);
}
.detail-image { aspect-ratio: 1 / 1; overflow: hidden; border-radius: 22px; background: var(--app-surface-soft); }
.detail-image img { width: 100%; height: 100%; object-fit: cover; }
.image-placeholder { display: grid; place-items: center; height: 100%; color: #91a5aa; background: linear-gradient(145deg, #edf5f3, #f8faf7); }
.image-placeholder ion-icon { font-size: 5rem; }
.badge-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.badge-row ion-chip { height: 29px; margin: 0; font-size: 0.7rem; font-weight: 750; }
.badge-row ion-badge { padding: 6px 9px; border-radius: 99px; font-size: 0.62rem; letter-spacing: 0.04em; text-transform: uppercase; }
.detail-copy h1 { margin: 0; color: var(--app-ink); font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -0.045em; line-height: 1.06; }
.price { margin: 12px 0 18px; color: var(--ion-color-primary); font-size: 1.55rem; font-weight: 800; }
.description { margin: 0 0 22px; color: var(--app-muted); font-size: 0.92rem; line-height: 1.7; white-space: pre-line; }
.quantity-panel { display: flex; align-items: center; gap: 12px; padding: 13px; border-radius: 15px; background: var(--app-surface-soft); }
.quantity-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: var(--ion-color-primary); background: var(--app-primary-soft); }
.quantity-panel span, .quantity-panel strong { display: block; }
.quantity-panel span { margin-bottom: 3px; color: var(--app-muted); font-size: 0.7rem; }
.quantity-panel strong { color: var(--app-ink); font-size: 0.9rem; }
.action-buttons { display: flex; gap: 10px; margin-top: 24px; }
.action-buttons ion-button { min-height: 45px; margin: 0; font-size: 0.8rem; font-weight: 750; text-transform: none; }
.action-buttons ion-spinner { width: 17px; margin-right: 7px; }
.record-card { margin-top: 18px; padding: 22px; border: 1px solid var(--app-border); border-radius: 22px; background: #fff; box-shadow: var(--app-card-shadow); }
.record-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.record-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: #4079a4; background: #eaf2f8; }
.eyebrow { margin: 0; color: var(--ion-color-primary); font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.record-heading h2 { margin: 2px 0 0; color: var(--app-ink); font-size: 1rem; }
.timeline-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; }
.timeline-grid > div { min-width: 0; padding: 4px 18px; border-left: 1px solid var(--app-border); }
.timeline-grid > div:first-child { padding-left: 0; border-left: 0; }
.timeline-grid span, .timeline-grid strong { display: block; }
.timeline-grid span { margin-bottom: 5px; color: var(--app-muted); font-size: 0.69rem; }
.timeline-grid strong { overflow: hidden; color: var(--app-ink); font-size: 0.78rem; text-overflow: ellipsis; white-space: nowrap; }
.product-id { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
@media (max-width: 720px) {
  .product-overview { grid-template-columns: 1fr; }
  .detail-image { aspect-ratio: 4 / 3; }
  .timeline-grid { grid-template-columns: 1fr; }
  .timeline-grid > div, .timeline-grid > div:first-child { padding: 12px 0; border-top: 1px solid var(--app-border); border-left: 0; }
  .timeline-grid > div:first-child { padding-top: 0; border-top: 0; }
}
@media (max-width: 400px) { .action-buttons { display: grid; } }
</style>
