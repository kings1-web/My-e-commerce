<template>
  <!-- Pass reactive cart count directly from the store instead of drilling data -->
  <Navbar :cartCount="cartStore.cartCount" @resetCartCount="resetCartCount"/>
  
  <RouterView 
    v-if="categories && products" 
    style="min-height: 60vh;" 
    :baseURL="baseURL" 
    :categories="categories" 
    :products="products" 
    @category-deleted="removeCategory" 
    @product-deleted="removeProduct" 
    @fetchData="fetchData" 
  />
  
  <!-- Modern Loading State for E-commerce UX -->
  <div v-else class="loading-spinner">
    <div class="d-flex justify-content-center align-items-center vh-100">
  <!-- 🟢 Using Bootstrap translation utilities for sizing if Iconify styles aren't loaded -->
  <i class="bi bi-arrow-repeat text-warning spinner-icon" style="font-size: 5rem;"></i>
<p>welcome to ShoppersFix</p>
</div>
  </div>

  <Footer />
</template>

<script>
import { useCartStore } from "./stores/CartStore";
import { useAuthStore } from "./stores/auth";
import axios from "axios";
import Navbar from "./views/Category/Navbar.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "AppCanvas",
  components: { Footer, Navbar },
  
  setup() {
    // Initialize stores inside setup for best Pinia compatibility in Vue 3
    const authStore = useAuthStore();
    const cartStore = useCartStore();
    return { authStore, cartStore };
  },

  data() {
    return {
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/",
     // baseURL:"http://localhost:3000/api/v1/",
      products: null,
      categories: null,
      authInterval: null
    }
  },

  methods: {
    async fetchData() {
      try {
        // Run requests in parallel to speed up page load time
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${this.baseURL}categories`),
          axios.get(`${this.baseURL}products`)
        ]);
        
        this.categories = catRes.data;
        this.products = prodRes.data;
      } catch (err) {
        console.error("ShoppersFix API Error:", err);
      }
    },
    removeProduct(deletedId) {
      this.products = this.products.filter(p => p.id !== deletedId);
    },
    removeCategory(deletedId) {
      this.categories = this.categories.filter(c => c.id !== deletedId);
    },
    resetCartCount() {
      // Direct store mutation or action clear
      this.cartStore.clearCartCount(); 
    }
  },

  mounted() {
    this.authStore.loadFromStorage();
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.cartStore.loadCartForUser(userId);
    }
    
    this.fetchData();
    
    // Store interval reference so we can clean it up
    this.authInterval = setInterval(() => {
      this.authStore.checkTokenAndLogoutIfExpired();
    }, 60000);
  },

  beforeUnmount() {
    // Clean up interval to prevent memory leaks if the component unmounts
    if (this.authInterval) clearInterval(this.authInterval);
  }
}
</script>

<style scoped>
/* Clean up the scrollbar experience */
html {
  scroll-behavior: smooth;
}
.spinner-icon {
  display: inline-block;
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-spinner {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  color: #555;
}
</style>

