<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Products</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/products/add" aria-label="Add product">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container catalog-page">
        <header class="page-heading">
          <div>
            <p class="eyebrow">Browse inventory</p>
            <h1>Product catalog</h1>
            <p>Find, filter, and manage all of your products.</p>
          </div>
          <span v-if="!loading" class="product-count">{{ products.length }} total</span>
        </header>

        <section class="filter-panel" aria-label="Product filters">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search products..."
            :debounce="150"
            show-clear-button="focus"
          />
          <div class="category-filter">
            <ion-icon :icon="optionsOutline" />
            <ion-select v-model="selectedCategory" interface="popover" aria-label="Filter by category">
              <ion-select-option value="All Categories">All Categories</ion-select-option>
              <ion-select-option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
                {{ category }}
              </ion-select-option>
            </ion-select>
          </div>
        </section>

        <div v-if="errorMessage" class="notice error-notice">
          <ion-icon :icon="warningOutline" />
          <div><strong>Unable to load products</strong><span>{{ errorMessage }}</span></div>
        </div>

        <section v-if="loading" class="catalog-grid" aria-label="Loading products">
          <ion-card v-for="item in 6" :key="item" class="loading-card">
            <ion-skeleton-text :animated="true" class="image-skeleton" />
            <ion-card-content>
              <ion-skeleton-text :animated="true" style="width: 38%" />
              <ion-skeleton-text :animated="true" style="width: 80%; height: 18px" />
              <ion-skeleton-text :animated="true" style="width: 58%" />
            </ion-card-content>
          </ion-card>
        </section>

        <section v-else-if="filteredProducts.length" class="catalog-grid" aria-live="polite">
          <product-card v-for="product in filteredProducts" :key="product.id" :product="product" />
        </section>

        <empty-state
          v-else-if="!errorMessage && products.length === 0"
          title="No products available"
          message="Add your first product to begin building your catalog."
          button-text="Add first product"
        />

        <empty-state
          v-else-if="!errorMessage"
          :icon="searchOutline"
          title="No products found"
          :message="emptyMessage"
          button-text="Clear filters"
          button-link="/products"
          @click="clearFilters"
        />
      </main>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button router-link="/products/add" aria-label="Add product">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <bottom-navigation />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { addOutline, optionsOutline, searchOutline, warningOutline } from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyState from '@/components/EmptyState.vue';
import ProductCard from '@/components/ProductCard.vue';
import { PRODUCT_CATEGORIES, type Product } from '@/interfaces/Product';
import { subscribeToProducts } from '@/services/productService';
import { getErrorMessage } from '@/utils/productUtils';

const products = ref<Product[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('All Categories');
const loading = ref(true);
const errorMessage = ref('');
let unsubscribe: () => void = () => undefined;

const filteredProducts = computed(() => {
  const search = searchQuery.value.trim().toLowerCase();

  return products.value.filter((product) => {
    const matchesSearch = !search || product.name.toLowerCase().includes(search);
    const matchesCategory =
      selectedCategory.value === 'All Categories' || product.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const emptyMessage = computed(() => {
  if (selectedCategory.value !== 'All Categories' && !searchQuery.value) {
    return `No products found in ${selectedCategory.value}. Try another category.`;
  }
  return 'Try a different product name or clear your category filter.';
});

function clearFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'All Categories';
}

onMounted(() => {
  unsubscribe = subscribeToProducts(
    (data) => {
      products.value = data;
      loading.value = false;
      errorMessage.value = '';
    },
    (error) => {
      errorMessage.value = getErrorMessage(error);
      loading.value = false;
    },
  );
});

onBeforeUnmount(() => unsubscribe());
</script>

<style scoped>
.catalog-page {
  padding-top: 24px;
  padding-bottom: 92px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 23px;
}

.page-heading h1 {
  margin: 3px 0 5px;
  color: var(--app-ink);
  font-size: clamp(1.85rem, 5vw, 2.5rem);
  letter-spacing: -0.04em;
}

.page-heading > div > p:last-child {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.9rem;
}

.eyebrow {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.product-count {
  flex: none;
  padding: 7px 11px;
  border-radius: 99px;
  color: var(--app-muted);
  background: #fff;
  box-shadow: 0 4px 16px rgba(26, 54, 65, 0.06);
  font-size: 0.75rem;
  font-weight: 750;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  gap: 10px;
  margin-bottom: 22px;
  padding: 8px;
  border: 1px solid var(--app-border);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--app-card-shadow);
}

.filter-panel ion-searchbar {
  --background: var(--app-surface-soft);
  --border-radius: 12px;
  --box-shadow: none;
  --color: var(--app-ink);
  --icon-color: var(--app-muted);
  padding: 0;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 10px;
  border-left: 1px solid var(--app-border);
  color: var(--app-muted);
}

.category-filter > ion-icon {
  flex: 0 0 auto;
  font-size: 1.1rem;
}

.category-filter ion-select {
  width: 100%;
  color: var(--app-ink);
  font-size: 0.82rem;
  font-weight: 650;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.loading-card {
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--app-border);
  border-radius: 20px;
  box-shadow: none;
}

.image-skeleton {
  height: 180px;
  margin: 0;
}

ion-fab {
  margin-bottom: 14px;
  margin-right: 8px;
}

ion-fab-button {
  --box-shadow: 0 12px 28px rgba(26, 127, 112, 0.28);
}

@media (max-width: 740px) {
  .catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .filter-panel {
    grid-template-columns: 1fr;
  }

  .category-filter {
    border-top: 1px solid var(--app-border);
    border-left: 0;
  }
}

@media (max-width: 360px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
