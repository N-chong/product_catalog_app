<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button :default-href="`/products/${productId}`" /></ion-buttons>
        <ion-title>Edit Product</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container form-page">
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
          <header class="page-heading">
            <p class="eyebrow">Update record</p>
            <h1>Edit {{ product.name }}</h1>
            <p>Make your changes below, then save the updated product.</p>
          </header>

          <div v-if="errorMessage" class="notice error-notice" role="alert">
            <ion-icon :icon="warningOutline" />
            <div><strong>Product was not updated</strong><span>{{ errorMessage }}</span></div>
          </div>

          <product-form
            :key="product.id"
            :initial-data="initialData"
            :initial-image-url="product.imageUrl"
            :submitting="submitting"
            submit-text="Save Changes"
            loading-text="Updating product..."
            @submit="handleSubmit"
          />
        </template>
      </main>
    </ion-content>

    <bottom-navigation />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue';
import { warningOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyState from '@/components/EmptyState.vue';
import ProductForm from '@/components/ProductForm.vue';
import type { Product, ProductFormData } from '@/interfaces/Product';
import { getProductById, updateProduct } from '@/services/productService';
import { getErrorMessage } from '@/utils/productUtils';

const route = useRoute();
const router = useRouter();
const productId = computed(() => String(route.params.id));
const product = ref<Product | null>(null);
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');

const initialData = computed<ProductFormData | null>(() => {
  if (!product.value) return null;
  return {
    name: product.value.name,
    category: product.value.category,
    price: product.value.price,
    description: product.value.description,
    quantity: product.value.quantity,
  };
});

async function loadProduct() {
  loading.value = true;
  errorMessage.value = '';
  try {
    product.value = await getProductById(productId.value);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    product.value = null;
  } finally {
    loading.value = false;
  }
}

async function handleSubmit(data: ProductFormData, image: File | null) {
  if (submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';

  try {
    await updateProduct(productId.value, data, image);
    const toast = await toastController.create({
      message: 'Product updated successfully.',
      duration: 2200,
      color: 'success',
      position: 'top',
    });
    await toast.present();
    await router.replace(`/products/${productId.value}`);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    submitting.value = false;
  }
}

onIonViewWillEnter(loadProduct);
</script>

<style scoped>
.form-page {
  max-width: 850px;
  padding-top: clamp(27px, 5vw, 45px);
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

.page-heading {
  max-width: 650px;
  margin-bottom: 28px;
}

.page-heading h1 {
  margin: 3px 0 7px;
  color: var(--app-ink);
  font-size: clamp(2rem, 6vw, 3rem);
  letter-spacing: -0.05em;
  line-height: 1.05;
}

.page-heading > p:last-child {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.87rem;
}

.eyebrow {
  margin: 0;
  color: var(--app-violet);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
