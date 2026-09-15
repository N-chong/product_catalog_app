<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="toolbar-content">
          <div class="brand-mark"><ion-icon :icon="cubeOutline" /></div>
          <div>
            <p>My inventory</p>
            <ion-title>Product Catalog</ion-title>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <main class="page-container dashboard-page">
        <section class="dashboard-hero">
          <div class="hero-copy">
            <span class="hero-label">Inventory overview</span>
            <h1>Everything in one simple catalog.</h1>
            <p>Track products, categories, and stock levels at a glance.</p>
            <ion-button router-link="/products" shape="round">
              View products
              <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </div>
          <div class="hero-art" aria-hidden="true">
            <span class="art-circle large"><ion-icon :icon="storefrontOutline" /></span>
            <span class="art-circle small"><ion-icon :icon="pricetagOutline" /></span>
          </div>
        </section>

        <div v-if="errorMessage" class="notice error-notice">
          <ion-icon :icon="warningOutline" />
          <div><strong>Unable to load your catalog</strong><span>{{ errorMessage }}</span></div>
        </div>

        <section aria-labelledby="summary-heading">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">Live summary</p>
              <h2 id="summary-heading">Inventory snapshot</h2>
            </div>
            <span class="live-label"><i /> Live</span>
          </div>

          <div class="summary-grid">
            <article v-for="stat in statistics" :key="stat.label" class="stat-card">
              <div class="stat-icon" :class="stat.tone"><ion-icon :icon="stat.icon" /></div>
              <div>
                <strong v-if="!loading">{{ stat.value }}</strong>
                <ion-skeleton-text v-else :animated="true" class="stat-skeleton" />
                <span>{{ stat.label }}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="recent-section" aria-labelledby="recent-heading">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">Recently added</p>
              <h2 id="recent-heading">Latest products</h2>
            </div>
            <ion-button fill="clear" size="small" router-link="/products">
              See all <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-button>
          </div>

          <div v-if="loading" class="product-grid">
            <ion-card v-for="item in 2" :key="item" class="loading-card">
              <ion-skeleton-text :animated="true" class="image-skeleton" />
              <ion-card-content>
                <ion-skeleton-text :animated="true" style="width: 38%" />
                <ion-skeleton-text :animated="true" style="width: 82%" />
                <ion-skeleton-text :animated="true" style="width: 55%" />
              </ion-card-content>
            </ion-card>
          </div>

          <div v-else-if="recentProducts.length" class="product-grid">
            <product-card v-for="product in recentProducts" :key="product.id" :product="product" />
          </div>

          <empty-state
            v-else-if="!errorMessage"
            title="Your catalog is empty"
            message="Add your first product to see your inventory summary come to life."
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
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import {
  alertCircleOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  cubeOutline,
  layersOutline,
  pricetagOutline,
  storefrontOutline,
  warningOutline,
} from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyState from '@/components/EmptyState.vue';
import ProductCard from '@/components/ProductCard.vue';
import type { Product } from '@/interfaces/Product';
import { subscribeToProducts } from '@/services/productService';
import { getErrorMessage } from '@/utils/productUtils';

const products = ref<Product[]>([]);
const loading = ref(true);
const errorMessage = ref('');
let unsubscribe: () => void = () => undefined;

const recentProducts = computed(() => products.value.slice(0, 3));
const categoryCount = computed(() => new Set(products.value.map((product) => product.category)).size);
const lowStockCount = computed(
  () => products.value.filter((product) => product.quantity > 0 && product.quantity <= 5).length,
);
const outOfStockCount = computed(
  () => products.value.filter((product) => product.quantity === 0).length,
);

const statistics = computed(() => [
  { label: 'Total products', value: products.value.length, icon: cubeOutline, tone: 'teal' },
  { label: 'Categories', value: categoryCount.value, icon: layersOutline, tone: 'blue' },
  { label: 'Low stock', value: lowStockCount.value, icon: alertCircleOutline, tone: 'amber' },
  { label: 'Out of stock', value: outOfStockCount.value, icon: warningOutline, tone: 'coral' },
]);

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
  padding-top: 16px;
}

.dashboard-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(190px, 0.6fr);
  min-height: 260px;
  overflow: hidden;
  padding: clamp(26px, 5vw, 48px);
  border-radius: 28px;
  color: white;
  background:
    radial-gradient(circle at 72% 5%, rgba(255, 255, 255, 0.16), transparent 28%),
    linear-gradient(135deg, #123c42, #176c64 62%, #1a8a77);
  box-shadow: 0 18px 44px rgba(18, 60, 66, 0.2);
}

.hero-copy {
  position: relative;
  z-index: 2;
  align-self: center;
  max-width: 570px;
}

.hero-label {
  display: inline-block;
  margin-bottom: 12px;
  padding: 6px 11px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 520px;
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.15rem);
  font-weight: 780;
  letter-spacing: -0.04em;
  line-height: 1.03;
}

.hero-copy p {
  margin: 15px 0 22px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
}

.hero-copy ion-button {
  --background: #fff;
  --color: #165c56;
  --box-shadow: none;
  font-weight: 750;
  text-transform: none;
}

.hero-art {
  position: relative;
  min-height: 170px;
}

.art-circle {
  position: absolute;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.17);
  color: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.art-circle.large {
  top: 14px;
  right: 12px;
  width: 150px;
  height: 150px;
  border-radius: 48px;
  transform: rotate(7deg);
}

.art-circle.large ion-icon {
  font-size: 4.5rem;
}

.art-circle.small {
  right: 128px;
  bottom: -12px;
  width: 76px;
  height: 76px;
  border-radius: 25px;
  transform: rotate(-12deg);
}

.art-circle.small ion-icon {
  font-size: 2rem;
}

.section-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin: 34px 2px 16px;
}

.section-title-row h2 {
  margin: 2px 0 0;
  color: var(--app-ink);
  font-size: 1.35rem;
  letter-spacing: -0.025em;
}

.eyebrow {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.live-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--app-muted);
  font-size: 0.74rem;
  font-weight: 700;
}

.live-label i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ion-color-success);
  box-shadow: 0 0 0 4px rgba(40, 161, 114, 0.12);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 19px;
  border: 1px solid var(--app-border);
  border-radius: 19px;
  background: #fff;
  box-shadow: var(--app-card-shadow);
}

.stat-icon {
  display: grid;
  flex: 0 0 43px;
  place-items: center;
  width: 43px;
  height: 43px;
  border-radius: 14px;
}

.stat-icon ion-icon {
  font-size: 1.28rem;
}

.stat-icon.teal { color: #16806f; background: #e5f5f1; }
.stat-icon.blue { color: #4079a4; background: #eaf2f8; }
.stat-icon.amber { color: #a56a13; background: #fff2d9; }
.stat-icon.coral { color: #bf5548; background: #ffebe7; }

.stat-card strong,
.stat-card span {
  display: block;
}

.stat-card strong {
  color: var(--app-ink);
  font-size: 1.5rem;
  line-height: 1.1;
}

.stat-card span {
  overflow: hidden;
  margin-top: 4px;
  color: var(--app-muted);
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-skeleton {
  width: 42px;
  height: 24px;
  margin: 0 0 5px;
  border-radius: 6px;
}

.recent-section {
  padding-bottom: 18px;
}

.section-title-row ion-button {
  --color: var(--ion-color-primary);
  margin: 0 -7px -5px 0;
  font-size: 0.75rem;
  font-weight: 750;
  text-transform: none;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.loading-card {
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--app-border);
  border-radius: 20px;
  box-shadow: none;
}

.image-skeleton {
  height: 175px;
  margin: 0;
}

@media (max-width: 760px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .hero-art {
    position: absolute;
    right: -45px;
    bottom: -40px;
    width: 210px;
    opacity: 0.72;
  }

  .hero-copy {
    padding-right: 38px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .dashboard-hero {
    min-height: 300px;
    padding: 27px 23px;
    border-radius: 24px;
  }

  .hero-copy {
    align-self: start;
    padding-right: 0;
  }

  .hero-copy h1 {
    font-size: 2.08rem;
  }

  .hero-art {
    right: -62px;
    opacity: 0.46;
  }

  .stat-card {
    display: block;
    padding: 15px;
  }

  .stat-icon {
    margin-bottom: 13px;
  }

  .product-grid {
    gap: 11px;
  }
}
</style>
