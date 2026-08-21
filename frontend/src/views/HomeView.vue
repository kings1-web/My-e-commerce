<template>
  <div id="home">
    <!-- 🟢 SPLIT HERO PROMO BANNER -->
    <div class="container mt-3">
      <div
        class="p-4 p-md-5 rounded-3 bg-dark text-white position-relative overflow-hidden shadow-sm hero-banner"
      >
        <div
          class="row align-items-center position-relative"
          style="z-index: 2"
        >
          <!-- LEFT SIDE: Text, Badges & Call-to-Actions -->
          <div class="col-lg-6 text-start mb-4 mb-lg-0">
            <span class="badge bg-warning text-dark fw-bold mb-3 px-3 py-2">
              🚀 Ondo & Nationwide Delivery
            </span>
            <h1 class="display-6 fw-bold mb-3 text-warning">
              Quality Plumbing, Electrical & Solar Accessories
            </h1>
            <p class="lead text-light mb-4 fs-6 opacity-90">
              Buy genuine installation accessories, tools, and electronics at
              unbeatable prices.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <a
                href="#shop-now"
                class="btn btn-warning fw-bold px-4 py-2 shadow-sm"
              >
                🛍️ Shop Products
              </a>
              <RouterLink
                to="/installers"
                class="btn btn-outline-light fw-bold px-4 py-2"
              >
                🛠️ Book a Handyman
              </RouterLink>
            </div>
          </div>

          <!-- RIGHT SIDE: Only Featured Product Image Slide -->
          <div class="col-lg-6 ps-lg-4 mt-3 mt-lg-0">
            <HeroFeaturedSlide :baseURL="baseURL" :count="5" />
          </div>
        </div>
      </div>
    </div>

    <!-- Category Slider -->
    <div class="container mt-3">
      <CategorySlider :categories="categories" />
    </div>

    <!-- Featured Products Section -->
    <div class="container py-2">
      <div
        class="text-white pt-2 py-2 px-3 rounded mt-2 d-flex justify-content-between align-items-center"
        style="background-color: orangered"
      >
        <h3 class="m-0 fs-4 fw-bold">🔥 Featured Products</h3>
        <span class="small text-white-50">Best Deals Available</span>
      </div>

      <div class="card-body py-2">
        <FeaturedCarousel :baseURL="baseURL" :count="60" />
      </div>
    </div>

    <!-- Top Categories -->
    <div class="container">
      <div
        class="text-white pt-2 py-2 px-3 rounded mt-2 d-flex justify-content-between align-items-center"
        style="background-color: purple"
      >
        <h3 id="start-shopping" class="m-0 fs-4 fw-bold">
          📦 Shop by Category
        </h3>
      </div>

      <div class="mt-3">
        <select
          class="form-select form-select-lg w-100 rounded-3 shadow-sm border-0 py-2 px-3"
          v-on:change="category"
          required
        >
          <option selected disabled>Select a Category...</option>
          <option
            v-for="category of categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="row">
        <div
          v-for="(category, index) in latestCategories"
          :key="index"
          class="col-md-6 col-xl-3 col-6 pt-3 justify-content-around d-flex"
        >
          <CategoryBox :category="category" />
        </div>
      </div>
    </div>

    <!-- Top Products Grid -->
    <div class="container py-3">
      <div
        class="text-white bg-primary pt-2 py-2 px-3 rounded d-flex justify-content-between align-items-center"
      >
        <h3 id="shop-now" class="m-0 fs-4 fw-bold">🛒 Top Products</h3>
        
              <RouterLink
                to="/product"
                class="btn btn-outline-light fw-bold px-4 py-2"
              >
                See All...
              </RouterLink>
        <span class="small text-white-50">In Stock Now</span>
      </div>

      <div class="row">
        <div
          v-for="(product, index) in latestProducts"
          :key="index"
          class="col-md-6 col-xl-3 col-6 pt-3 justify-content-around d-flex"
        >
          <ProductBox :product="product" />
        </div>
      </div>
    </div>

    <!-- Floating WhatsApp Call Button -->
    <div
      style="z-index: 100; font-size: 50px"
      class="position-fixed bottom-0 end-0 m-3"
    >
      <a
        href="https://wa.link/3pxzcs"
        target="_blank"
        class="text-success hover-scale"
        aria-label="Order on WhatsApp"
      >
        <i class="bi bi-whatsapp"></i>
      </a>
    </div>
  </div>
</template>

<script>
import HeroFeaturedSlide from "@/components/HeroFeaturedSlide.vue";
import CategorySlider from "@/components/CategorySlider.vue";
import FeaturedCarousel from "@/components/FeaturedCarousel.vue";
import ProductBox from "@/components/CategoryBox/ProductBox.vue";
import CategoryBox from "@/components/CategoryBox/CategoryBox.vue";

export default {
  name: "Home",
  components: {
    CategoryBox,
    ProductBox,
    FeaturedCarousel,
    CategorySlider,
    HeroFeaturedSlide,
  },
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    products: {
      type: Array,
      default: () => [],
    },
    baseURL: String,
  },
  data() {
    return {
      categorySize: 4,
      productSize: 60,
    };
  },
  methods: {
    category(e) {
      e.preventDefault();
      this.$router.push("/category/show/" + e.target.value);
    },
    updateSizes() {
      this.categorySize = Math.min(4, this.categories?.length || 0);
      this.productSize = Math.min(60, this.products?.length || 0);
    },
  },
  computed: {
    latestCategories() {
      if (!this.categories || !this.categories.length) return [];
      return [...this.categories].reverse().slice(0, this.categorySize);
    },
    latestProducts() {
      if (!this.products || !this.products.length) return [];
      return [...this.products].reverse().slice(0, this.productSize);
    },
  },
  watch: {
    categories: {
      handler() {
        this.updateSizes();
      },
      deep: true,
      immediate: true,
    },
    products: {
      handler() {
        this.updateSizes();
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.updateSizes();
  },
};
</script>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #0d0d0d 0%, #212529 100%);
  border-left: 5px solid #ffc107;
}

/* Transforms logo into pure plain white monochrome */
.hero-white-logo {
  max-height: 140px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease;
}

.hero-white-logo:hover {
  transform: scale(1.05);
}

.hover-scale {
  transition: transform 0.2s ease;
  display: inline-block;
}

.hover-scale:hover {
  transform: scale(1.15);
}

.form-select-lg {
  background-color: purple;
  color: white;
  max-width: 100%;
}

@media (min-width: 992px) {
  .border-start-lg {
    border-left: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
}
</style>
