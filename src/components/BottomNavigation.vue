<template>
  <ion-footer class="app-footer ion-no-border">
    <ion-toolbar>
      <nav class="bottom-navigation" aria-label="Main navigation">
        <ion-button
          v-for="item in navigationItems"
          :key="item.path"
          :class="{ active: isActive(item.path) }"
          :aria-current="isActive(item.path) ? 'page' : undefined"
          fill="clear"
          :router-link="item.path"
          router-direction="root"
        >
          <span class="nav-item">
            <span class="nav-icon-wrap"><ion-icon :icon="item.icon" /></span>
            <span>{{ item.label }}</span>
          </span>
        </ion-button>
      </nav>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonButton, IonFooter, IonIcon, IonToolbar } from '@ionic/vue';
import { addCircleOutline, gridOutline, storefrontOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';

const route = useRoute();

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: gridOutline },
  { label: 'Products', path: '/products', icon: storefrontOutline },
  { label: 'Add Product', path: '/products/add', icon: addCircleOutline },
];

function isActive(path: string): boolean {
  if (path === '/products') {
    return route.path.startsWith('/products') && route.path !== '/products/add';
  }
  return route.path === path;
}
</script>

<style scoped>
.app-footer {
  background: transparent;
}

.app-footer ion-toolbar {
  --background: rgba(255, 255, 255, 0.96);
  --border-width: 1px 0 0;
  --border-color: var(--app-border);
  --min-height: 72px;
  backdrop-filter: blur(14px);
}

.bottom-navigation {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: min(100%, 560px);
  margin: 0 auto;
  padding: 5px 8px max(5px, env(safe-area-inset-bottom));
}

.bottom-navigation ion-button {
  --color: var(--app-muted);
  --padding-start: 4px;
  --padding-end: 4px;
  min-height: 58px;
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.bottom-navigation ion-button.active {
  --color: var(--ion-color-primary);
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}

.nav-icon-wrap {
  display: grid;
  place-items: center;
  width: 38px;
  height: 28px;
  border-radius: 14px;
  transition: background 160ms ease;
}

.active .nav-icon-wrap {
  background: var(--app-primary-soft);
}

.nav-icon-wrap ion-icon {
  font-size: 1.35rem;
}
</style>
