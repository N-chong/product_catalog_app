<template>
  <section class="empty-state">
    <div class="empty-icon"><ion-icon :icon="icon" /></div>
    <p class="empty-label">Catalog message</p>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <ion-button v-if="buttonText" :router-link="buttonLink">
      {{ buttonText }}
    </ion-button>
  </section>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { cubeOutline } from 'ionicons/icons';

withDefaults(defineProps<{
  title: string;
  message: string;
  buttonText?: string;
  buttonLink?: string;
  icon?: string;
}>(), {
  buttonText: '',
  buttonLink: '/products/add',
  icon: cubeOutline,
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 420px;
  margin: 52px auto;
  padding: 30px 0;
  border-top: 2px solid var(--app-ink);
  border-bottom: 1px solid var(--app-border-strong);
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 17px;
  border: 1px solid #bdcaf0;
  border-radius: 7px;
  color: var(--ion-color-primary);
  background: var(--app-primary-soft);
  box-shadow: 5px 5px 0 var(--app-violet-soft);
}

.empty-icon ion-icon {
  font-size: 1.65rem;
}

.empty-label {
  margin: 0 0 5px;
  color: var(--app-violet);
  font-size: 0.64rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h2 {
  margin: 0 0 8px;
  color: var(--app-ink);
  font-size: 1.28rem;
  letter-spacing: -0.025em;
}

.empty-state > p:last-of-type {
  margin: 0 0 21px;
  color: var(--app-muted);
  font-size: 0.87rem;
  line-height: 1.6;
}

.empty-state ion-button {
  --border-radius: 7px;
  --box-shadow: none;
  min-height: 43px;
  margin: 0;
  font-size: 0.78rem;
}
</style>
