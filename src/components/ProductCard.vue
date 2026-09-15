<template>
  <article
    class="product-row"
    role="link"
    tabindex="0"
    :aria-label="`Open ${product.name}`"
    @click="openProduct"
    @keydown.enter="openProduct"
    @keydown.space.prevent="openProduct"
  >
    <div class="product-thumbnail">
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
      <div v-else class="image-placeholder" aria-label="No product image">
        <ion-icon :icon="imageOutline" />
      </div>
    </div>

    <div class="product-copy">
      <span class="category">{{ product.category }}</span>
      <h2>{{ product.name }}</h2>
      <strong class="price">{{ formatCurrency(product.price) }}</strong>
    </div>

    <div class="stock-copy">
      <ion-badge :color="getStockColor(product.quantity)">
        {{ getStockStatus(product.quantity) }}
      </ion-badge>
      <span>{{ product.quantity }} {{ product.quantity === 1 ? 'unit' : 'units' }} available</span>
    </div>

    <ion-icon class="row-arrow" :icon="chevronForwardOutline" aria-hidden="true" />
  </article>
</template>

<script setup lang="ts">
import { IonBadge, IonIcon } from '@ionic/vue';
import { chevronForwardOutline, imageOutline } from 'ionicons/icons';
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
.product-row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr) minmax(145px, auto) 18px;
  gap: 17px;
  align-items: center;
  min-height: 112px;
  padding: 16px 4px;
  border-top: 1px solid var(--app-border);
  background: var(--app-surface);
  cursor: pointer;
  outline: none;
  transition: background 140ms ease;
}

.product-row:hover,
.product-row:focus-visible {
  background: #f8f9fc;
}

.product-row:focus-visible {
  box-shadow: inset 3px 0 0 var(--ion-color-primary);
}

.product-thumbnail {
  width: 78px;
  height: 78px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 7px;
  background: var(--app-surface-soft);
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #8893a3;
  background: var(--app-primary-soft);
}

.image-placeholder ion-icon {
  font-size: 1.75rem;
}

.product-copy {
  min-width: 0;
}

.category {
  display: block;
  overflow: hidden;
  margin-bottom: 3px;
  color: var(--app-violet);
  font-size: 0.63rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

h2 {
  overflow: hidden;
  margin: 0 0 6px;
  color: var(--app-ink);
  font-size: 0.98rem;
  font-weight: 760;
  letter-spacing: -0.015em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  color: var(--ion-color-primary);
  font-size: 0.88rem;
}

.stock-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  text-align: right;
}

.stock-copy ion-badge {
  padding: 5px 7px;
  border-radius: 4px;
  font-size: 0.57rem;
  font-weight: 850;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.stock-copy span {
  color: var(--app-muted);
  font-size: 0.7rem;
  white-space: nowrap;
}

.row-arrow {
  color: #949dab;
  font-size: 1rem;
}

@media (max-width: 560px) {
  .product-row {
    grid-template-columns: 70px minmax(0, 1fr) 14px;
    gap: 13px;
    min-height: 116px;
    padding: 14px 1px;
  }

  .product-thumbnail {
    width: 70px;
    height: 82px;
  }

  .stock-copy {
    grid-column: 2;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: -4px;
    text-align: left;
  }

  .stock-copy span {
    font-size: 0.66rem;
  }

  .row-arrow {
    grid-column: 3;
    grid-row: 1 / span 2;
  }
}
</style>
