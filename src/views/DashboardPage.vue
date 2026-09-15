<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="toolbar-shell">
          <div class="app-identity">
            <span class="app-symbol" aria-hidden="true" />
            <div>
              <strong>Product Catalog</strong>
              <span>{{ todayLabel }}</span>
            </div>
          </div>
          <ion-button class="header-add-button" router-link="/products/add">
            <ion-icon slot="start" :icon="addOutline" /> Add
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container dashboard-page">
        <header class="dashboard-intro">
          <p class="eyebrow">{{ greeting }}</p>
          <h1>Kapag kailangan mo, Wala kami.</h1>
          <p>Walang kanen buseng???</p>
        </header>

        <div v-if="errorMessage" class="notice error-notice" role="alert">
          <ion-icon :icon="warningOutline" />
          <div><strong>Unable to load your catalog</strong><span>{{ errorMessage }}</span></div>
        </div>

        <section class="inventory-overview" aria-labelledby="inventory-heading">
          <div class="primary-total">
            <ion-skeleton-text v-if="loading" :animated="true" class="total-skeleton" />
            <strong v-else>{{ products.length }}</strong>
            <span id="inventory-heading">Products in catalog</span>
            <ion-button fill="clear" router-link="/products">
              Open catalog <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </div>

          <div class="stock-summary">
            <div class="section-kicker">
              <span>Inventory status</span>
              <small>Calculated from quantity</small>
            </div>
            <div v-for="status in stockSummary" :key="status.label" class="status-row">
              <span class="status-name"><i :class="status.tone" />{{ status.label }}</span>
              <strong v-if="!loading">{{ status.value }}</strong>
              <ion-skeleton-text v-else :animated="true" class="row-skeleton" />
            </div>
          </div>
        </section>

        <section class="dashboard-columns">
          <div class="dashboard-section category-section">
            <div class="section-heading">
              <div><p class="eyebrow">Catalog groups</p><h2>Categories</h2></div>
              <span>{{ categoryCount }} active</span>
            </div>
            <div class="category-list">
              <div v-for="(category, index) in categorySummary" :key="category.name" class="category-row">
                <span class="category-marker" :class="{ violet: index % 2 }" />
                <span>{{ category.name }}</span>
                <strong>{{ category.count }}</strong>
              </div>
            </div>
          </div>

          <div class="dashboard-section attention-section">
            <div class="section-heading">
              <div><p class="eyebrow violet-text">Stock check</p><h2>Needs attention</h2></div>
              <span>{{ attentionProducts.length }} shown</span>
            </div>

            <div v-if="attentionProducts.length" class="attention-list">
              <router-link
                v-for="product in attentionProducts"
                :key="product.id"
                class="attention-row"
                :to="`/products/${product.id}`"
              >
                <div>
                  <strong>{{ product.name }}</strong>
                  <span>{{ product.quantity === 0 ? 'Out of stock' : `Only ${product.quantity} remaining` }}</span>
                </div>
                <span class="compact-status" :class="product.quantity === 0 ? 'out' : 'low'">
                  {{ product.quantity === 0 ? 'Out' : 'Low' }}
                </span>
              </router-link>
            </div>
            <p v-else-if="!loading" class="quiet-state">All products have healthy stock levels.</p>
            <div v-else class="loading-lines">
              <ion-skeleton-text v-for="item in 3" :key="item" :animated="true" />
            </div>
          </div>
        </section>

        <section class="recent-section" aria-labelledby="recent-heading">
          <div class="section-heading">
            <div><p class="eyebrow">Latest records</p><h2 id="recent-heading">Recently added</h2></div>
            <ion-button fill="clear" size="small" router-link="/products">
              View all <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </div>

          <div v-if="loading" class="loading-product-list">
            <ion-skeleton-text v-for="item in 3" :key="item" :animated="true" />
          </div>
          <div v-else-if="recentProducts.length" class="product-list">
            <product-card v-for="product in recentProducts" :key="product.id" :product="product" />
          </div>
          <empty-state
            v-else-if="!errorMessage"
            title="Your catalog is empty"
            message="Add your first product to begin monitoring your inventory."
            button-text="Add first product"
          />
        </section>
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
  IonSkeletonText,
  IonToolbar,
} from '@ionic/vue';
import { addOutline, arrowForwardOutline, warningOutline } from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyState from '@/components/EmptyState.vue';
import ProductCard from '@/components/ProductCard.vue';
import { PRODUCT_CATEGORIES, type Product } from '@/interfaces/Product';
import { subscribeToProducts } from '@/services/productService';
import { getErrorMessage } from '@/utils/productUtils';

const products = ref<Product[]>([]);
const loading = ref(true);
const errorMessage = ref('');
let unsubscribe: () => void = () => undefined;

const todayLabel = new Intl.DateTimeFormat('en-PH', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date());

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const recentProducts = computed(() => products.value.slice(0, 3));
const categoryCount = computed(() => new Set(products.value.map((product) => product.category)).size);
const lowStockCount = computed(
  () => products.value.filter((product) => product.quantity > 0 && product.quantity <= 5).length,
);
const outOfStockCount = computed(
  () => products.value.filter((product) => product.quantity === 0).length,
);
const inStockCount = computed(
  () => products.value.filter((product) => product.quantity > 5).length,
);

const stockSummary = computed(() => [
  { label: 'In stock', value: inStockCount.value, tone: 'in-stock' },
  { label: 'Low stock', value: lowStockCount.value, tone: 'low-stock' },
  { label: 'Out of stock', value: outOfStockCount.value, tone: 'out-stock' },
]);

const categorySummary = computed(() => PRODUCT_CATEGORIES
  .map((name) => ({
    name,
    count: products.value.filter((product) => product.category === name).length,
  }))
  .filter((category) => category.count > 0));

const attentionProducts = computed(() => products.value
  .filter((product) => product.quantity <= 5)
  .sort((a, b) => a.quantity - b.quantity)
  .slice(0, 4));

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
.dashboard-page {
  padding-top: clamp(30px, 6vw, 58px);
  padding-bottom: 52px;
}

.dashboard-intro {
  max-width: 680px;
  margin-bottom: 34px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--ion-color-primary);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.violet-text {
  color: var(--app-violet);
}

.dashboard-intro h1 {
  margin: 0;
  color: var(--app-ink);
  font-size: clamp(2rem, 6vw, 3.45rem);
  font-weight: 780;
  letter-spacing: -0.05em;
  line-height: 1.03;
}

.dashboard-intro > p:last-child {
  margin: 13px 0 0;
  color: var(--app-muted);
  font-size: 0.94rem;
}

.inventory-overview {
  display: grid;
  grid-template-columns: minmax(230px, 0.8fr) minmax(300px, 1.2fr);
  border-top: 1px solid var(--app-border-strong);
  border-bottom: 1px solid var(--app-border-strong);
  background: var(--app-surface);
}

.primary-total {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 245px;
  padding: 32px clamp(24px, 5vw, 48px);
  border-right: 1px solid var(--app-border);
  border-left: 5px solid var(--ion-color-primary);
}

.primary-total strong {
  color: var(--app-ink);
  font-size: clamp(4.5rem, 12vw, 7.5rem);
  font-weight: 760;
  letter-spacing: -0.075em;
  line-height: 0.9;
}

.primary-total > span {
  margin-top: 13px;
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.primary-total ion-button {
  --color: var(--ion-color-primary);
  --padding-start: 0;
  --padding-end: 0;
  min-height: 32px;
  margin: 12px 0 0;
  font-size: 0.77rem;
}

.total-skeleton {
  width: 120px;
  height: 78px;
  margin: 0;
}

.stock-summary {
  padding: 29px clamp(24px, 5vw, 48px);
}

.section-kicker {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--app-border);
}

.section-kicker span {
  color: var(--app-ink);
  font-size: 0.88rem;
  font-weight: 780;
}

.section-kicker small {
  color: var(--app-muted);
  font-size: 0.68rem;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  border-bottom: 1px solid var(--app-border);
}

.status-row:last-child {
  border-bottom: 0;
}

.status-name {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--app-ink-soft);
  font-size: 0.83rem;
}

.status-name i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-name .in-stock { background: var(--ion-color-success); }
.status-name .low-stock { background: var(--ion-color-warning); }
.status-name .out-stock { background: var(--ion-color-danger); }

.status-row strong {
  color: var(--app-ink);
  font-size: 1.12rem;
}

.row-skeleton {
  width: 28px;
  height: 18px;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(34px, 7vw, 72px);
  margin-top: 46px;
}

.dashboard-section,
.recent-section {
  min-width: 0;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  min-height: 52px;
  padding-bottom: 13px;
  border-bottom: 2px solid var(--app-ink);
}

.section-heading h2 {
  margin: 0;
  color: var(--app-ink);
  font-size: 1.18rem;
  letter-spacing: -0.025em;
}

.section-heading > span {
  color: var(--app-muted);
  font-size: 0.7rem;
}

.section-heading ion-button {
  --color: var(--ion-color-primary);
  --padding-end: 0;
  min-height: 30px;
  margin: 0;
  font-size: 0.73rem;
}

.category-list,
.attention-list {
  background: var(--app-surface);
}

.category-row,
.attention-row {
  display: flex;
  align-items: center;
  min-height: 57px;
  border-bottom: 1px solid var(--app-border);
}

.category-marker {
  width: 3px;
  height: 24px;
  margin-right: 13px;
  background: var(--ion-color-primary);
}

.category-marker.violet {
  background: var(--app-violet);
}

.category-row > span:nth-child(2) {
  flex: 1;
  color: var(--app-ink-soft);
  font-size: 0.82rem;
}

.category-row strong {
  padding-right: 15px;
  color: var(--app-ink);
  font-size: 0.9rem;
}

.attention-row {
  justify-content: space-between;
  gap: 16px;
  padding: 9px 14px 9px 0;
  color: inherit;
  text-decoration: none;
}

.attention-row div {
  min-width: 0;
}

.attention-row strong,
.attention-row div span {
  display: block;
}

.attention-row strong {
  overflow: hidden;
  color: var(--app-ink);
  font-size: 0.83rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attention-row div span {
  margin-top: 2px;
  color: var(--app-muted);
  font-size: 0.7rem;
}

.compact-status {
  padding: 4px 7px;
  border-radius: 4px;
  font-size: 0.58rem;
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.compact-status.low { color: #8a5200; background: #fff2d7; }
.compact-status.out { color: #a52f3d; background: #ffe9ec; }

.quiet-state {
  min-height: 120px;
  margin: 0;
  padding: 28px 0;
  color: var(--app-muted);
  font-size: 0.82rem;
}

.loading-lines {
  display: grid;
  gap: 12px;
  padding-top: 15px;
}

.loading-lines ion-skeleton-text {
  height: 38px;
  margin: 0;
}

.recent-section {
  margin-top: 50px;
}

.product-list {
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
}

.loading-product-list {
  display: grid;
  gap: 1px;
  background: var(--app-border);
}

.loading-product-list ion-skeleton-text {
  height: 104px;
  margin: 0;
}

@media (max-width: 720px) {
  .inventory-overview,
  .dashboard-columns {
    grid-template-columns: 1fr;
  }

  .primary-total {
    min-height: 205px;
    border-right: 0;
    border-bottom: 1px solid var(--app-border);
  }

  .dashboard-columns {
    gap: 40px;
  }
}

@media (max-width: 420px) {
  .dashboard-page {
    padding-top: 26px;
  }

  .dashboard-intro h1 {
    font-size: 2.2rem;
  }

  .primary-total,
  .stock-summary {
    padding-right: 20px;
    padding-left: 20px;
  }

  .section-kicker {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
