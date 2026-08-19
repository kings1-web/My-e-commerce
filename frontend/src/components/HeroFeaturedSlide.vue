<template>
  <div class="hero-featured-wrapper w-100">
    <!-- Loading Placeholder -->
    <div v-if="loading" class="hero-placeholder rounded-3 d-flex align-items-center justify-content-center text-white-50">
      <div class="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
      Loading featured product...
    </div>

    <!-- Swiper displaying ONLY the image -->
    <Swiper
      v-else-if="products.length > 0"
      :modules="modules"
      :slides-per-view="1"
      :autoplay="{ delay: 4000, disableOnInteraction: false }"
      :loop="products.length > 1"
      class="hero-swiper rounded-3 overflow-hidden shadow-sm"
    >
      <SwiperSlide v-for="product in products" :key="product.id || product._id">
        <RouterLink :to="{ name: 'ShowDetails', params: { id: product.id || product._id } }" class="d-block w-100 h-100">
          <div class="image-wrapper position-relative">
            <img 
              :src="product.image || fallbackImage" 
              :alt="product.name" 
              class="hero-product-img"
            />
          </div>
        </RouterLink>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script>
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Autoplay } from "swiper/modules";

export default {
  name: "HeroFeaturedSlide",
  components: { Swiper, SwiperSlide },
  props: {
    baseURL: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      products: [],
      loading: true,
      fallbackImage: "https://via.placeholder.com/600x400?text=Featured+Product",
    };
  },
  methods: {
    fetchFeaturedProducts() {
      this.loading = true;
      axios
        .get(`${this.baseURL}products/get/featured/${this.count}`)
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.products = res.data;
          }
        })
        .catch((err) => {
          console.error("Failed to load hero featured products:", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.fetchFeaturedProducts();
  },
  setup() {
    return {
      modules: [Autoplay],
    };
  },
};
</script>

<style scoped>
.hero-featured-wrapper {
  max-width: 100%;
}

.hero-placeholder {
  height: 260px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.hero-swiper {
  width: 100%;
  height: 260px;
  background: #000;
}

.image-wrapper {
  width: 100%;
  height: 100%;
}

.hero-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.hero-product-img:hover {
  transform: scale(1.03);
}

@media (max-width: 768px) {
  .hero-swiper,
  .hero-placeholder {
    height: 200px;
  }
}
</style>