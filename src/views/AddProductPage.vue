<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/products" /></ion-buttons>
        <ion-title>Add Product</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container form-page">
        <header class="page-heading">
          <p class="eyebrow">Create a record</p>
          <h1>Add a new product</h1>
          <p>Enter the details below. You can update them at any time.</p>
        </header>

        <div v-if="errorMessage" class="notice error-notice" role="alert">
          <ion-icon :icon="warningOutline" />
          <div><strong>Product was not saved</strong><span>{{ errorMessage }}</span></div>
        </div>

        <product-form
          :submitting="submitting"
          submit-text="Add Product"
          loading-text="Adding product..."
          @submit="handleSubmit"
        />
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
  IonTitle,
  IonToolbar,
  toastController,
} from '@ionic/vue';
import { warningOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BottomNavigation from '@/components/BottomNavigation.vue';
import ProductForm from '@/components/ProductForm.vue';
import type { ProductFormData } from '@/interfaces/Product';
import { addProduct } from '@/services/productService';
import { getErrorMessage } from '@/utils/productUtils';

const router = useRouter();
const submitting = ref(false);
const errorMessage = ref('');

async function showToast(message: string, color: 'success' | 'warning' | 'danger') {
  const toast = await toastController.create({
    message,
    duration: color === 'warning' ? 4500 : 2800,
    color,
    position: 'top',
    buttons: [{ text: 'Close', role: 'cancel' }],
  });
  await toast.present();
}

async function handleSubmit(data: ProductFormData, image: File | null) {
  if (submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';

  try {
    const result = await addProduct(data, image);

    if (result.imageWarning) {
      await showToast(result.imageWarning, 'warning');
    } else {
      await showToast('Product added successfully.', 'success');
    }

    await router.replace(`/products/${result.id}`);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    await showToast(errorMessage.value, 'danger');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.form-page {
  max-width: 760px;
  padding-top: 25px;
}

.page-heading {
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 3px 0 6px;
  color: var(--app-ink);
  font-size: clamp(1.85rem, 5vw, 2.4rem);
  letter-spacing: -0.04em;
}

.page-heading > p:last-child {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.9rem;
}

.eyebrow {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
