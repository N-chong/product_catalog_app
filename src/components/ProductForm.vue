<template>
  <form class="product-form" novalidate @submit.prevent="validateAndSubmit">
    <section class="form-panel">
      <header class="form-header">
        <div>
          <p>Product information</p>
          <h2>{{ submitText === 'Add Product' ? 'New product details' : 'Update product details' }}</h2>
        </div>
        <span>* Required</span>
      </header>

      <div class="form-stack">
        <div class="field-group">
          <label class="field-label" for="product-name">Product name *</label>
          <ion-input
            id="product-name"
            v-model="form.name"
            class="form-control"
            fill="outline"
            aria-label="Product name"
            placeholder="Example: Naging kayo ba?"
            :maxlength="80"
            :class="{ 'ion-invalid ion-touched': errors.name }"
          />
          <p v-if="errors.name" class="field-error" role="alert">{{ errors.name }}</p>
        </div>

        <div class="field-group">
          <label class="field-label" for="product-category">Category *</label>
          <ion-select
            id="product-category"
            v-model="form.category"
            class="form-control select-control"
            fill="outline"
            aria-label="Product category"
            interface="action-sheet"
            placeholder="Choose a category"
            :class="{ 'ion-invalid ion-touched': errors.category }"
          >
            <ion-select-option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
              {{ category }}
            </ion-select-option>
          </ion-select>
          <p v-if="errors.category" class="field-error" role="alert">{{ errors.category }}</p>
        </div>

        <div class="two-column-fields">
          <div class="field-group">
            <label class="field-label" for="product-price">Price (₱) *</label>
            <ion-input
              id="product-price"
              v-model.number="form.price"
              class="form-control"
              fill="outline"
              aria-label="Product price in Philippine pesos"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              :class="{ 'ion-invalid ion-touched': errors.price }"
            />
            <p v-if="errors.price" class="field-error" role="alert">{{ errors.price }}</p>
          </div>

          <div class="field-group">
            <label class="field-label" for="product-quantity">Quantity *</label>
            <ion-input
              id="product-quantity"
              v-model.number="form.quantity"
              class="form-control"
              fill="outline"
              aria-label="Product quantity"
              type="number"
              inputmode="numeric"
              min="0"
              step="1"
              placeholder="0"
              :class="{ 'ion-invalid ion-touched': errors.quantity }"
            />
            <p v-if="errors.quantity" class="field-error" role="alert">{{ errors.quantity }}</p>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="product-description">Description *</label>
          <ion-textarea
            id="product-description"
            v-model="form.description"
            class="form-control description-control"
            fill="outline"
            aria-label="Product description"
            :auto-grow="true"
            :maxlength="500"
            :counter="true"
            :rows="4"
            placeholder="Short product description"
            :class="{ 'ion-invalid ion-touched': errors.description }"
          />
          <p v-if="errors.description" class="field-error" role="alert">{{ errors.description }}</p>
        </div>

        <div class="field-group image-field">
          <div class="image-label-row">
            <label class="field-label" for="product-image">Product image</label>
            <span>Optional · max 5 MB</span>
          </div>
          <label class="image-picker" for="product-image">
            <img v-if="previewUrl" :src="previewUrl" alt="Selected product preview" />
            <span v-else class="picker-placeholder">
              <ion-icon :icon="cameraOutline" />
              <strong>Add photo</strong>
              <small>ano masakit, mabangga ng ebike o makita siyang may kasamang iba?</small>
            </span>
            <span v-if="previewUrl" class="change-photo">
              <ion-icon :icon="cameraOutline" /> Change
            </span>
          </label>
          <input
            id="product-image"
            class="native-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="handleImageChange"
          />
          <p v-if="errors.image" class="field-error" role="alert">{{ errors.image }}</p>
        </div>
      </div>

      <ion-button class="submit-button" type="submit" expand="block" :disabled="submitting">
        <ion-spinner v-if="submitting" name="crescent" />
        <ion-icon v-else slot="start" :icon="saveOutline" />
        {{ submitting ? loadingText : submitText }}
      </ion-button>
    </section>
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
  padding-bottom: 34px;
  color: var(--app-ink);
}

.form-panel {
  overflow: hidden;
  padding: clamp(20px, 5vw, 30px);
  border: 1px solid #aebbe2;
  border-top: 5px solid var(--app-violet);
  border-radius: 12px;
  background: rgba(244, 246, 255, 0.92);
  box-shadow: 0 12px 30px rgba(47, 43, 105, 0.09);
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #c7cee5;
}

.form-header p {
  margin: 0 0 2px;
  color: var(--ion-color-primary);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.form-header h2 {
  margin: 0;
  color: var(--app-ink);
  font-size: 1.15rem;
  letter-spacing: -0.025em;
}

.form-header > span {
  color: var(--app-violet);
  font-size: 0.68rem;
  font-weight: 750;
}

.form-stack {
  display: grid;
  gap: 19px;
}

.two-column-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field-group {
  min-width: 0;
}

.field-label {
  display: block;
  margin: 0 2px 7px;
  color: var(--app-ink-soft);
  font-size: 0.81rem;
  font-weight: 760;
}

.form-control {
  --background: #ffffff;
  --border-color: #aeb7cb;
  --border-radius: 7px;
  --border-width: 1px;
  --color: var(--app-ink);
  --highlight-color-focused: var(--ion-color-primary);
  --placeholder-color: #747e8d;
  --placeholder-opacity: 1;
  --padding-start: 13px;
  --padding-end: 13px;
  min-height: 51px;
  font-size: 0.94rem;
}

.form-control.ion-focused {
  --border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(37, 87, 214, 0.11);
}

.select-control::part(icon) {
  color: var(--app-violet);
}

.description-control {
  min-height: 120px;
}

.field-error {
  margin: 6px 3px 0;
  color: #a72f3f;
  font-size: 0.75rem;
  font-weight: 650;
}

.image-field {
  padding-top: 4px;
}

.image-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.image-label-row span {
  color: var(--app-muted);
  font-size: 0.65rem;
}

.image-picker {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 145px;
  overflow: hidden;
  border: 1px dashed #8999c3;
  border-radius: 7px;
  background: #e8edff;
  cursor: pointer;
}

.image-picker img {
  width: 100%;
  height: 210px;
  object-fit: cover;
}

.picker-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--ion-color-primary);
}

.picker-placeholder ion-icon {
  margin-bottom: 2px;
  font-size: 1.65rem;
}

.picker-placeholder strong {
  color: var(--app-ink);
  font-size: 0.82rem;
}

.picker-placeholder small {
  color: var(--app-muted);
  font-size: 0.66rem;
}

.change-photo {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 10px;
  border-radius: 5px;
  color: #ffffff;
  background: var(--app-violet);
  font-size: 0.69rem;
  font-weight: 750;
}

.native-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.submit-button {
  --background: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary-shade);
  --border-radius: 7px;
  --box-shadow: none;
  --color: #ffffff;
  min-height: 52px;
  margin: 25px 0 0;
  font-size: 0.88rem;
}

.submit-button::part(native) {
  border-right: 7px solid var(--app-violet);
}

.submit-button ion-spinner {
  width: 18px;
  margin-right: 8px;
}

@media (max-width: 480px) {
  .form-panel {
    padding: 19px 16px 20px;
    border-radius: 9px;
  }

  .two-column-fields {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .field-label {
    font-size: 0.84rem;
  }

  .form-control {
    min-height: 54px;
    font-size: 1rem;
  }
}
</style>
