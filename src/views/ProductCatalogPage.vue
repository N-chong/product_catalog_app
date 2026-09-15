<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="toolbar-shell">
          <div class="app-identity">
            <span class="app-symbol" aria-hidden="true" />
            <div><strong>Products</strong><span>Catalog workspace</span></div>
          </div>
          <ion-button class="header-add-button" router-link="/products/add">
            <ion-icon slot="start" :icon="addOutline" /> Add
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container catalog-page">
        <header class="page-heading">
          <div>
            <p class="eyebrow">Inventory directory</p>
            <h1>Product catalog</h1>
            <p>Hinahanap-hanap kita.</p>
          </div>
          <strong v-if="!loading" class="large-count">{{ products.length }}</strong>
        </header>

        <section class="catalog-controls" aria-label="Product filters">
          <label class="search-label">Search products</label>
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search product name..."
            :debounce="150"
            show-clear-button="focus"
          />

          <div class="filter-heading">
            <span>Filter by category</span>
            <small>Swipe to see more</small>
          </div>
          <div class="filter-scroll" role="group" aria-label="Product category">
            <button
              v-for="category in allCategories"
              :key="category"
              type="button"
              :class="{ active: selectedCategory === category }"
              :aria-pressed="selectedCategory === category"
              @click="selectedCategory = category"
            >
              {{ category === 'All Categories' ? 'All' : category }}
            </button>
          </div>
        </section>

        <div v-if="errorMessage" class="notice error-notice" role="alert">
          <ion-icon :icon="warningOutline" />
          <div><strong>Unable to load products</strong><span>{{ errorMessage }}</span></div>
        </div>

        <section v-if="loading" class="loading-list" aria-label="Loading products">
          <ion-skeleton-text v-for="item in 6" :key="item" :animated="true" />
        </section>

        <section v-else-if="filteredProducts.length" aria-live="polite">
          <div class="list-heading">
            <span>{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'product' : 'products' }}</span>
            <small>Newest first</small>
          </div>
          <div class="catalog-list">
            <product-card v-for="product in filteredProducts" :key="product.id" :product="product" />
          </div>
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
    </ion-content>

    <bottom-navigation />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonSkeletonText,
  IonToolbar,
} from '@ionic/vue';
import { addOutline, searchOutline, warningOutline } from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyState from '@/components/EmptyState.vue';
import ProductCard from '@/components/ProductCard.vue';
import { PRODUCT_CATEGORIES, type Product } from '@/interfaces/Product';
import { subscribeToProducts } from '@/services/productService';
import { getErrorMessage } from '@/utils/productUtils';

const allCategories = ['All Categories', ...PRODUCT_CATEGORIES] as const;
const products = ref<Product[]>([]);
const searchQuery = ref('');
const selectedCategory = ref<(typeof allCategories)[number]>('All Categories');
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
  padding-top: clamp(30px, 6vw, 52px);
  padding-bottom: 48px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.eyebrow {
  margin: 0 0 5px;
  color: var(--app-violet);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.105em;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: var(--app-ink);
  font-size: clamp(2rem, 6vw, 3.2rem);
  letter-spacing: -0.05em;
  line-height: 1.04;
}

.page-heading p:last-child {
  margin: 10px 0 0;
  color: var(--app-muted);
  font-size: 0.88rem;
}

.large-count {
  color: var(--ion-color-primary);
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 760;
  letter-spacing: -0.07em;
  line-height: 0.85;
}

.catalog-controls {
  margin-bottom: 32px;
  padding: 21px 0 24px;
  border-top: 1px solid var(--app-border-strong);
  border-bottom: 1px solid var(--app-border-strong);
}

.search-label,
.filter-heading span {
  display: block;
  color: var(--app-ink-soft);
  font-size: 0.72rem;
  font-weight: 800;
}

.search-label {
  margin: 0 0 7px 2px;
}

.catalog-controls ion-searchbar {
  --background: #ffffff;
  --border-radius: 8px;
  --box-shadow: inset 0 0 0 1px var(--app-border-strong);
  --color: var(--app-ink);
  --icon-color: var(--ion-color-primary);
  --placeholder-color: var(--app-muted);
  min-height: 54px;
  padding: 0;
}

.filter-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 2px 9px;
}

.filter-heading small {
  color: var(--app-muted);
  font-size: 0.64rem;
}

.filter-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 3px;
  scrollbar-width: none;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-scroll button {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--app-border-strong);
  border-radius: 5px;
  color: var(--app-ink-soft);
  background: #ffffff;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.filter-scroll button.active {
  border-color: var(--ion-color-primary);
  color: #ffffff;
  background: var(--ion-color-primary);
}

.filter-scroll button:nth-child(even).active {
  border-color: var(--app-violet);
  background: var(--app-violet);
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  border-bottom: 2px solid var(--app-ink);
}

.list-heading span {
  color: var(--app-ink);
  font-size: 0.79rem;
  font-weight: 800;
}

.list-heading small {
  color: var(--app-muted);
  font-size: 0.66rem;
}

.catalog-list {
  border-bottom: 1px solid var(--app-border);
}

.loading-list {
  display: grid;
  gap: 1px;
  border-top: 2px solid var(--app-ink);
  background: var(--app-border);
}

.loading-list ion-skeleton-text {
  height: 110px;
  margin: 0;
}

@media (max-width: 520px) {
  .catalog-page {
    padding-top: 27px;
  }

  .page-heading {
    align-items: flex-start;
  }

  .page-heading h1 {
    font-size: 2.25rem;
  }

  .page-heading p:last-child {
    max-width: 240px;
  }

  .large-count {
    padding-top: 5px;
    font-size: 3.25rem;
  }
}
</style>
