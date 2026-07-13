<template>
  <div class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h3 class="pt-3">Shopping Cart</h3>
      </div>

      <!-- If user is logged in -->
      <div v-if="token">

        <!-- If cart has items -->
        <div v-if="cart.length > 0">
          <div
            v-for="item in cart"
            :key="item.id"
            class="row mt-2 pt-3 justify-content-around"
          >
            <div class="col-2"></div>

            <!-- Product Image -->
            <div class="col-md-3">
              <img
                :src="item.image"
                alt="product"
                class="w-100"
                style="object-fit: cover;"
              />
            </div>

            <!-- Product Details -->
            <div class="col-md-5 px-3">
              <h6>
                <RouterLink
                  :to="{ name: 'ShowDetails', params: { id: item.id } }"
                >
                  {{ item.name }}
                </RouterLink>
              </h6>

              <p class="fw-bold mb-0">
                {{ formatPrice(item.price) }} per unit
              </p>

              <p class="m-0">
                Quantity: {{ item.quantity }}
              </p>

              <p class="text-end">
                Total:
                <span class="fw-bold">
                  {{ formatPrice(item.price * item.quantity) }}
                </span>
              </p>

              <a href="#" @click.prevent="removeItem(item.id)">
                Remove From Cart
              </a>

              <br /><br />

              <RouterLink
                :to="{ name: 'ShowDetails', params: { id: item.id } }"
              >
                Edit Cart
              </RouterLink>
            </div>

            <div class="col-12">
              <hr />
            </div>
          </div>

          <!-- Total Section -->
          <div class="total-cost pt-2 text-end">
            <h5>Total: {{ formatPrice(totalPrice) }}</h5>
            <button
              class="btn btn-primary"
              @click="checkout"
            >
              Proceed for payment
            </button>
          </div>
        </div>

        <!-- Empty Cart -->
        <div v-else class="text-center">
          <i class="bi bi-cart4" style="font-size:35px; color:orange"></i>
          <h4>You currently have no items in your cart</h4>
          <h5>Browse our categories and discover our best deals!</h5>

          <RouterLink
            :to="{ name: 'home' }"
            class="btn btn-warning text-white"
          >
            Start Shopping!!!
          </RouterLink>
        </div>

      </div>

      <!-- Not Logged In -->
      <div v-else class="text-center">
        <i class="bi bi-cart4" style="font-size:35px;"></i>

        <h5>
          Can't find your cart items?
          <RouterLink :to="{ name: 'Login' }">Sign In</RouterLink>
          <br />
          Don't have an account?
          <RouterLink :to="{ name: 'SignUp' }">Sign Up</RouterLink>
        </h5>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from "@/stores/CartStore";

export default {
  props: ["baseURL", "cartCount"],

  data() {
    return {
      token: null,
    };
  },

  computed: {
    cart() {
      const cartStore = useCartStore();
      return cartStore.cart;
    },

    totalPrice() {
      const cartStore = useCartStore();
      return cartStore.totalPrice;
    },
  },

  methods: {
    formatPrice(value) {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(value);
    },

    checkout() {
      this.$router.push({ name: "BillingAddress" });
    },

    removeItem(productId) {
      const cartStore = useCartStore();
      cartStore.removeFromCart(productId);
    },
  },

  mounted() {
    this.token = localStorage.getItem("token");
  },
};
</script>

<style scoped>
h4,
h5 {
  color: #484848;
  font-weight: 700;
}
</style>