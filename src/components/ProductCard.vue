<template>
  <ion-card class="product-card" button @click="openProduct">
    <div class="image-shell">
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
      <div v-else class="image-placeholder" aria-label="No product image">
        <ion-icon :icon="imageOutline" />
      </div>
      <ion-badge :color="getStockColor(product.quantity)">
        {{ getStockStatus(product.quantity) }}
      </ion-badge>
    </div>

    <ion-card-content>
      <p class="category">{{ product.category }}</p>
      <h2>{{ product.name }}</h2>
      <div class="product-meta">
        <strong>{{ formatCurrency(product.price) }}</strong>
        <span>{{ product.quantity }} {{ product.quantity === 1 ? 'item' : 'items' }}</span>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonBadge, IonCard, IonCardContent, IonIcon } from '@ionic/vue';
import { imageOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import type { Product } from '@/interfaces/Product';
import { formatCurrency, getStockColor, getStockStatus } from '@/utils/productUtils';

const props = defineProps<{ product: Product }>();
const router = useRouter();

function openProduct() {
  if (props.product.id) router.push(`/products/${props.product.id}`);
}
</script>

<style scoped>
.product-card {
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--app-border);
  border-radius: 20px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 8px 28px rgba(26, 54, 65, 0.07);
  cursor: pointer;
}

.image-shell {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--app-surface-soft);
}

.image-shell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 220ms ease;
}

.product-card:hover .image-shell img {
  transform: scale(1.035);
}

.image-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #91a5aa;
  background: linear-gradient(145deg, #edf5f3, #f8faf7);
}

.image-placeholder ion-icon {
  font-size: 3rem;
}

.image-shell ion-badge {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 6px 9px;
  border-radius: 99px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.14);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

ion-card-content {
  padding: 15px;
}

.category {
  margin: 0 0 5px;
  color: var(--ion-color-primary);
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

h2 {
  display: -webkit-box;
  overflow: hidden;
  min-height: 2.7em;
  margin: 0 0 13px;
  color: var(--app-ink);
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.product-meta strong {
  color: var(--app-ink);
  font-size: 0.95rem;
}

.product-meta span {
  color: var(--app-muted);
  font-size: 0.76rem;
  white-space: nowrap;
}
</style>
