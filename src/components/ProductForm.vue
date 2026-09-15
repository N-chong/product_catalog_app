<template>
  <form class="product-form" novalidate @submit.prevent="validateAndSubmit">
    <section class="form-section image-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Product photo</p>
          <h2>Add a clear product image</h2>
          <p class="section-description">A square or landscape photo works best.</p>
        </div>
        <span class="optional-badge">Optional</span>
      </div>

      <label class="image-picker" for="product-image">
        <img v-if="previewUrl" :src="previewUrl" alt="Selected product preview" />
        <span v-else class="picker-placeholder">
          <span class="picker-icon"><ion-icon :icon="cameraOutline" /></span>
          <strong>Choose a product image</strong>
          <small>JPG, PNG, or WebP · maximum 5 MB</small>
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
      <p v-if="errors.image" class="field-error" role="alert">{{ errors.image }}</p>
    </section>

    <section class="form-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Product information</p>
          <h2>Enter the catalog details</h2>
          <p class="section-description">Fields marked with an asterisk are required.</p>
        </div>
      </div>

      <div class="form-stack">
        <div class="field-group">
          <label class="field-label" for="product-name">
            Product name <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <ion-input
            id="product-name"
            v-model="form.name"
            class="form-control"
            fill="outline"
            aria-label="Product name"
            placeholder="Example: Wireless Mouse"
            :maxlength="80"
            :class="{ 'ion-invalid ion-touched': errors.name }"
          />
          <p v-if="errors.name" class="field-error" role="alert">{{ errors.name }}</p>
        </div>

        <div class="field-group">
          <label class="field-label" for="product-category">
            Category <span class="required-mark" aria-hidden="true">*</span>
          </label>
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
            <label class="field-label" for="product-price">
              Price in pesos <span class="required-mark" aria-hidden="true">*</span>
            </label>
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
            <p class="field-hint">Use numbers only, such as 599.00.</p>
            <p v-if="errors.price" class="field-error" role="alert">{{ errors.price }}</p>
          </div>

          <div class="field-group">
            <label class="field-label" for="product-quantity">
              Quantity <span class="required-mark" aria-hidden="true">*</span>
            </label>
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
            <p class="field-hint">0 means the product is out of stock.</p>
            <p v-if="errors.quantity" class="field-error" role="alert">{{ errors.quantity }}</p>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="product-description">
            Description <span class="required-mark" aria-hidden="true">*</span>
          </label>
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
            placeholder="Describe the product and its important features"
            :class="{ 'ion-invalid ion-touched': errors.description }"
          />
          <p v-if="errors.description" class="field-error" role="alert">{{ errors.description }}</p>
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
  gap: 20px;
  padding-bottom: 28px;
}

.form-section {
  padding: clamp(19px, 4vw, 26px);
  border: 1px solid var(--app-border);
  border-radius: 24px;
  color: var(--app-ink);
  background: var(--app-surface);
  box-shadow: var(--app-card-shadow);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 3px 0 0;
  color: var(--app-ink);
  font-size: 1.18rem;
  font-weight: 750;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.section-description {
  margin: 6px 0 0;
  color: var(--app-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}

.optional-badge {
  flex: none;
  padding: 6px 10px;
  border: 1px solid var(--app-border);
  border-radius: 99px;
  color: var(--app-muted);
  background: var(--app-surface-soft);
  font-size: 0.72rem;
  font-weight: 700;
}

.eyebrow {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.image-picker {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 220px;
  overflow: hidden;
  border: 2px dashed #91b5ae;
  border-radius: 20px;
  color: var(--app-ink);
  background: linear-gradient(145deg, #f4faf8, #eaf3f1);
  cursor: pointer;
  transition: border-color 160ms ease, transform 160ms ease;
}

.image-picker:active {
  transform: scale(0.99);
}

.image-picker img {
  width: 100%;
  height: 270px;
  object-fit: cover;
}

.picker-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 24px;
  color: var(--app-ink);
  text-align: center;
}

.picker-placeholder strong {
  color: var(--app-ink);
  font-size: 0.95rem;
}

.picker-placeholder small {
  color: var(--app-muted);
  font-size: 0.76rem;
}

.picker-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin-bottom: 5px;
  border-radius: 19px;
  color: var(--ion-color-primary);
  background: var(--app-primary-soft);
  box-shadow: 0 7px 18px rgba(8, 121, 104, 0.12);
}

.picker-icon ion-icon {
  font-size: 1.7rem;
}

.change-photo {
  position: absolute;
  right: 13px;
  bottom: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 13px;
  border-radius: 99px;
  color: #ffffff;
  background: rgba(10, 38, 43, 0.9);
  font-size: 0.78rem;
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
  gap: 21px;
}

.field-group {
  min-width: 0;
}

.field-label {
  display: block;
  margin: 0 3px 8px;
  color: var(--app-ink-soft);
  font-size: 0.86rem;
  font-weight: 750;
  line-height: 1.3;
}

.required-mark {
  color: var(--ion-color-danger);
  font-weight: 800;
}

.two-column-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.form-control {
  --background: #fbfdfc;
  --border-color: #b9cdca;
  --border-radius: 13px;
  --border-width: 1px;
  --color: var(--app-ink);
  --highlight-color-focused: var(--ion-color-primary);
  --placeholder-color: #687e82;
  --placeholder-opacity: 1;
  --padding-start: 14px;
  --padding-end: 14px;
  min-height: 54px;
  color: var(--app-ink);
  font-size: 0.94rem;
}

.form-control.ion-focused {
  --background: #ffffff;
  --border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(8, 121, 104, 0.09);
}

.form-control::part(native),
.select-control::part(text),
.select-control::part(placeholder) {
  color: var(--app-ink);
  opacity: 1;
  font-weight: 500;
}

.select-control::part(icon) {
  color: var(--ion-color-primary);
  opacity: 1;
}

.description-control {
  min-height: 128px;
}

.field-hint {
  margin: 6px 4px 0;
  color: var(--app-muted);
  font-size: 0.72rem;
  line-height: 1.4;
}

.field-error {
  margin: 7px 4px 0;
  color: #a72f26;
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.4;
}

.submit-button {
  --background: linear-gradient(135deg, #088674, #06685d);
  --background-activated: #075f55;
  --box-shadow: 0 12px 27px rgba(8, 121, 104, 0.25);
  --color: #ffffff;
  min-height: 55px;
  margin: 4px 0 0;
  font-size: 0.95rem;
  font-weight: 750;
  text-transform: none;
}

.submit-button ion-spinner {
  width: 19px;
  margin-right: 9px;
}

@media (max-width: 520px) {
  .form-section {
    border-radius: 21px;
  }

  .section-heading h2 {
    font-size: 1.1rem;
  }

  .two-column-fields {
    grid-template-columns: 1fr;
    gap: 21px;
  }

  .field-label {
    font-size: 0.9rem;
  }

  .form-control {
    min-height: 56px;
    font-size: 1rem;
  }
}
</style>
