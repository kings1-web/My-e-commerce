<template>
  <div class="container">
    <div class="row pt-5">
      <!-- Image Carousel -->
      <div id="productImageCarousel" class="carousel slide mb-4 col-md-4 col-12" data-bs-ride="carousel">
        <div class="carousel-inner">
          <!-- Loop through all images including main image -->
          <div
            class="carousel-item"
            v-for="(img, index) in allImages"
            :key="index"
            :class="{ active: index === 0 }"
          >
            <img :src="img" class="img-fluid" alt="Product Image" />
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#productImageCarousel"
          data-bs-slide="prev"
          aria-label="Previous"
        >
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#productImageCarousel"
          data-bs-slide="next"
          aria-label="Next"
        >
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>

      <!-- Product Details -->
      <div class="col-md-6 col-12 pt-3 pt-md-0">
        <h4>{{ product.name }}</h4>
        <h6 class="category fst-italic">{{ category.name }}</h6>
        <h6 class="fw-bold">Price: {{ formatPrice(product.price) }}</h6>
        <p class="text-capitalize">{{ product.discription }}</p>

        <!-- Quantity & Add to Cart -->
        <div class="mt-3 d-flex justify-content-between">
          <div class="input-group">
            <span class="input-group-text">Quantity</span>
            <input
              type="number" class="form-control w-20" v-model.number="quantity" :min="1" />
          </div>
          <div class="input-group">
            <button
              class="btn"
              type="button"
              id="add-to-cart-button"
              @click="addProductToCart(product)"
            >
              Add to Cart
            </button>
          </div>
        </div>

        <!-- Product Features -->
        <div class="features pt-3 text-capitalize">
          <h5><strong>Features</strong></h5>
          <ul>
            <li style="white-space: pre-line;">
              {{ product.richDiscription }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/stores/CartStore';

export default {
  props: {
    baseURL: String,
    categories: Array,
    products: Array
  },
  data() {
    return {
      product: {},
      category: {},
      token: null,
      quantity: 1,
    };
  },
  computed: {
    allImages() {
      // Combine main image and additional images, filter out undefined/null
      const images = [this.product.image, ...(this.product.images || [])];
      return images.filter(Boolean);
    }
  },
  methods: {
    addProductToCart(product) {
      if (!this.token) {
        this.$swal({
          text: 'Please login to add item',
          icon: 'error',
        });
        return;
      }

      const CartStore = useCartStore();
      const qty = this.quantity > 0 ? this.quantity : 1;
      CartStore.addToCart(product, qty);
      this.$swal({
        text: 'Product added to cart successfully!',
        icon: 'success',
      });
    },
    checkout() {
      this.$router.push({ name: 'BillingAddress' });
    },
    formatPrice(value) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2,
      }).format(value);
    },
  },
  mounted() {
    const id = this.$route.params.id;
    this.product = this.products.find((p) => p && p.id == id) || {};
    this.category =
      this.categories.find((c) => c.id == this.product.category?.id) || {};
    this.token = localStorage.getItem('token');
     this.$emit("fetchData");
  },
};
</script>

<style scoped>
.category {
  font-weight: 400;
}
#wishlist-button {
  background-color: #b9b9b9;
}
#add-to-cart-button {
  background-color: orangered;
  color: white;
}
.form-control {
  width: 100%;
}
</style>

