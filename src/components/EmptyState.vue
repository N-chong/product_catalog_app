<template>
  <section class="empty-state">
    <div class="empty-icon"><ion-icon :icon="icon" /></div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <ion-button v-if="buttonText" :router-link="buttonLink" shape="round">
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
  align-items: center;
  max-width: 360px;
  margin: 42px auto;
  padding: 30px 22px;
  text-align: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin-bottom: 18px;
  border-radius: 24px;
  color: var(--ion-color-primary);
  background: var(--app-primary-soft);
}

.empty-icon ion-icon {
  font-size: 2rem;
}

h2 {
  margin: 0 0 7px;
  color: var(--app-ink);
  font-size: 1.2rem;
}

p {
  margin: 0 0 20px;
  color: var(--app-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}
</style>
