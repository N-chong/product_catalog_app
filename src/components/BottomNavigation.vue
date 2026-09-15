<template>
  <ion-footer class="app-footer ion-no-border">
    <ion-toolbar>
      <nav class="bottom-navigation" aria-label="Main navigation">
        <ion-button
          v-for="item in navigationItems"
          :key="item.path"
          :class="[{ active: isActive(item.path) }, item.kind]"
          :aria-current="isActive(item.path) ? 'page' : undefined"
          fill="clear"
          :router-link="item.path"
          router-direction="root"
        >
          <span class="nav-item">
            <ion-icon :icon="item.icon" />
            <span>{{ item.label }}</span>
          </span>
        </ion-button>
      </nav>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonButton, IonFooter, IonIcon, IonToolbar } from '@ionic/vue';
import { addOutline, gridOutline, listOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';

const route = useRoute();

const navigationItems = [
  { label: 'Home', path: '/dashboard', icon: gridOutline, kind: 'standard' },
  { label: 'Products', path: '/products', icon: listOutline, kind: 'standard' },
  { label: 'Add', path: '/products/add', icon: addOutline, kind: 'add-link' },
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
  --background: rgba(255, 255, 255, 0.98);
  --border-width: 1px 0 0;
  --border-color: var(--app-border-strong);
  --min-height: 70px;
}

.bottom-navigation {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 0 8px max(3px, env(safe-area-inset-bottom));
}

.bottom-navigation ion-button {
  position: relative;
  --color: var(--app-muted);
  --padding-start: 4px;
  --padding-end: 4px;
  min-height: 65px;
  margin: 0;
  font-size: 0.66rem;
  font-weight: 700;
}

.bottom-navigation ion-button::part(native) {
  border-radius: 0;
}

.bottom-navigation ion-button.active {
  --color: var(--ion-color-primary);
}

.bottom-navigation ion-button.active::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: 38px;
  height: 3px;
  background: var(--ion-color-primary);
  content: "";
  transform: translateX(-50%);
}

.bottom-navigation ion-button.add-link {
  --color: var(--app-violet);
}

.bottom-navigation ion-button.add-link.active::before {
  background: var(--app-violet);
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.nav-item ion-icon {
  font-size: 1.3rem;
}
</style>
