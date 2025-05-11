<template>
  <div class="container">
    <div class="row pt-5">
      <!-- Optional spacing column, can be removed if not needed -->
      <!-- <div class="col-md-1"></div> -->

      <!-- Display image -->
      <div id="productImageCarousel" class="carousel slide mb-4 col-md-4 col-12" data-bs-ride="carousel">
        <div class="carousel-inner">
          <!-- Main image as first carousel item -->
          <div class="carousel-item active">
            <img :src="product.image" class="img-fluid" alt="Main Image" />
          </div>
          <!-- Loop through additional images -->
          <div
            class="carousel-item"
            v-for="(img, index) in product.images"
            :key="index"
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

      <!-- Display product details -->
      <div class="col-md-6 col-12 pt-3 pt-md-0">
        <h4>{{ product.name }}</h4>
        <h6 class="category fst-italic">{{ category.name }}</h6>
        <h6 class="fw-bold">Price: {{ formatPrice(product.price) }}</h6>
        <p class="text-capitalize">
          {{ product.discription }}
        </p>

        <!-- Quantity and Add to Cart -->
        <div class="d-flex flex-row justify-content-between">
          <div class="input-group col-md-3 col p-0">
            <span class="input-group-text">Quantity</span>
            <input
              type="number"
              class="form-control"
              v-model.number="quantity"
              :min="1"
            />
          </div>
          <div class="input-group col-md-3 col p-0">
            <button
              class="btn"
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
  props: ['baseURL', 'categories', 'products'],
  data() {
    return {
      product: {},
      category: {},
      token: null,
      quantity: 1,
    };
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
    this.id = this.$route.params.id;
    this.product = this.products.find((product) => product && product.id == this.id) || {};
    this.category =
      this.categories.find((category) => category.id == this.product.category?.id) || {};
    this.token = localStorage.getItem('token');
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
