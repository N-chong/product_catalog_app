<template>
  <form class="product-form" novalidate @submit.prevent="validateAndSubmit">
    <section class="form-section image-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Product photo</p>
          <h2>Show what you're cataloging</h2>
        </div>
        <span>Optional</span>
      </div>

      <label class="image-picker" for="product-image">
        <img v-if="previewUrl" :src="previewUrl" alt="Selected product preview" />
        <span v-else class="picker-placeholder">
          <span class="picker-icon"><ion-icon :icon="cameraOutline" /></span>
          <strong>Choose a product image</strong>
          <small>JPG, PNG, or WebP</small>
        </span>
        <span v-if="previewUrl" class="change-photo">
          <ion-icon :icon="cameraOutline" /> Change photo
        </span>
      </label>
      <input
        id="product-image"
        class="native-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="handleImageChange"
      />
      <p v-if="errors.image" class="field-error">{{ errors.image }}</p>
    </section>

    <section class="form-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Basic information</p>
          <h2>Tell us about the product</h2>
        </div>
      </div>

      <div class="form-stack">
        <div>
          <ion-input
            v-model="form.name"
            class="form-control"
            fill="outline"
            label="Product name"
            label-placement="stacked"
            placeholder="e.g. Wireless Mouse"
            :maxlength="80"
            :class="{ 'ion-invalid ion-touched': errors.name }"
          />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div>
          <ion-select
            v-model="form.category"
            class="form-control"
            fill="outline"
            label="Category"
            label-placement="stacked"
            interface="popover"
            placeholder="Choose a category"
            :class="{ 'ion-invalid ion-touched': errors.category }"
          >
            <ion-select-option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
              {{ category }}
            </ion-select-option>
          </ion-select>
          <p v-if="errors.category" class="field-error">{{ errors.category }}</p>
        </div>

        <div class="two-column-fields">
          <div>
            <ion-input
              v-model.number="form.price"
              class="form-control"
              fill="outline"
              label="Price (PHP)"
              label-placement="stacked"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              :class="{ 'ion-invalid ion-touched': errors.price }"
            />
            <p v-if="errors.price" class="field-error">{{ errors.price }}</p>
          </div>

          <div>
            <ion-input
              v-model.number="form.quantity"
              class="form-control"
              fill="outline"
              label="Quantity"
              label-placement="stacked"
              type="number"
              inputmode="numeric"
              min="0"
              step="1"
              placeholder="0"
              :class="{ 'ion-invalid ion-touched': errors.quantity }"
            />
            <p v-if="errors.quantity" class="field-error">{{ errors.quantity }}</p>
          </div>
        </div>

        <div>
          <ion-textarea
            v-model="form.description"
            class="form-control"
            fill="outline"
            label="Description"
            label-placement="stacked"
            :auto-grow="true"
            :maxlength="500"
            :counter="true"
            placeholder="Add a short, helpful product description"
            :class="{ 'ion-invalid ion-touched': errors.description }"
          />
          <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        </div>
      </div>
    </section>

    <ion-button class="submit-button" type="submit" expand="block" shape="round" :disabled="submitting">
      <ion-spinner v-if="submitting" name="crescent" />
      <ion-icon v-else slot="start" :icon="saveOutline" />
      {{ submitting ? loadingText : submitText }}
    </ion-button>
  </form>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
} from '@ionic/vue';
import { cameraOutline, saveOutline } from 'ionicons/icons';
import { onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductFormData,
} from '@/interfaces/Product';

const props = withDefaults(defineProps<{
  initialData?: ProductFormData | null;
  initialImageUrl?: string;
  submitting?: boolean;
  submitText?: string;
  loadingText?: string;
}>(), {
  initialData: null,
  initialImageUrl: '',
  submitting: false,
  submitText: 'Save Product',
  loadingText: 'Saving...',
});

const emit = defineEmits<{
  submit: [data: ProductFormData, image: File | null];
}>();

const form = reactive<ProductFormData>({
  name: '',
  category: '' as ProductCategory,
  price: 0,
  description: '',
  quantity: 0,
});

const errors = reactive<Record<string, string>>({});
const selectedImage = ref<File | null>(null);
const previewUrl = ref('');
let objectUrl = '';

watch(
  () => props.initialData,
  (value) => {
    if (value) Object.assign(form, value);
  },
  { immediate: true },
);

watch(
  () => props.initialImageUrl,
  (value) => {
    if (!selectedImage.value) previewUrl.value = value;
  },
  { immediate: true },
);

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  errors.image = '';

  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    errors.image = 'Please choose a JPG, PNG, or WebP image.';
    input.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.image = 'The image must be smaller than 5 MB.';
    input.value = '';
    return;
  }

  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  selectedImage.value = file;
  previewUrl.value = objectUrl;
}

function validateAndSubmit() {
  Object.keys(errors).forEach((key) => delete errors[key]);

  form.name = form.name.trim();
  form.description = form.description.trim();
  form.price = Number(form.price);
  form.quantity = Number(form.quantity);

  if (!form.name) errors.name = 'Product name is required.';
  if (!form.category) errors.category = 'Please choose a category.';
  if (!Number.isFinite(form.price) || form.price < 0) {
    errors.price = 'Price must be zero or a positive number.';
  }
  if (!Number.isInteger(form.quantity) || form.quantity < 0) {
    errors.quantity = 'Quantity must be a positive whole number or zero.';
  }
  if (!form.description) errors.description = 'Description is required.';

  if (Object.values(errors).some(Boolean)) return;

  emit('submit', { ...form }, selectedImage.value);
}

onBeforeUnmount(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
</script>

<style scoped>
.product-form {
  display: grid;
  gap: 18px;
  padding-bottom: 20px;
}

.form-section {
  padding: 20px;
  border: 1px solid var(--app-border);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--app-card-shadow);
}

.section-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 2px 0 0;
  color: var(--app-ink);
  font-size: 1.08rem;
}

.section-heading > span {
  padding: 5px 9px;
  border-radius: 99px;
  color: var(--app-muted);
  background: var(--app-surface-soft);
  font-size: 0.68rem;
  font-weight: 700;
}

.eyebrow {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.image-picker {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 210px;
  overflow: hidden;
  border: 1.5px dashed #a9c2bd;
  border-radius: 18px;
  background: var(--app-surface-soft);
  cursor: pointer;
}

.image-picker img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.picker-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--app-ink);
}

.picker-placeholder small {
  color: var(--app-muted);
}

.picker-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 4px;
  border-radius: 18px;
  color: var(--ion-color-primary);
  background: var(--app-primary-soft);
}

.picker-icon ion-icon {
  font-size: 1.55rem;
}

.change-photo {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 99px;
  color: white;
  background: rgba(20, 42, 49, 0.84);
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.native-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.form-stack {
  display: grid;
  gap: 18px;
}

.two-column-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-control {
  --border-color: #cbd9d6;
  --border-radius: 12px;
  --highlight-color-focused: var(--ion-color-primary);
  --padding-start: 13px;
  --padding-end: 13px;
}

.field-error {
  margin: 6px 4px 0;
  color: var(--ion-color-danger);
  font-size: 0.75rem;
}

.submit-button {
  --box-shadow: 0 10px 24px rgba(26, 127, 112, 0.24);
  min-height: 52px;
  margin: 4px 0 0;
  font-weight: 750;
  text-transform: none;
}

.submit-button ion-spinner {
  width: 18px;
  margin-right: 9px;
}

@media (max-width: 430px) {
  .form-section {
    padding: 17px;
  }

  .two-column-fields {
    grid-template-columns: 1fr;
  }
}
</style>
