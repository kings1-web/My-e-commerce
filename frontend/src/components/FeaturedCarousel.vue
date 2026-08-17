<template>
  <div class="featured-wrapper">
    <div v-if="loading" class="text-center py-4">
      Loading featured products... wait a moment
    </div>

    <Swiper
      v-else-if="products.length > 0"
      :modules="modules"
      :slides-per-view="2"
      :space-between="15"
      :breakpoints="breakpoints"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      :loop="products.length > 1"
      :slides-per-group="1"
      class="mySwiper"
    >
      <SwiperSlide v-for="product in products" :key="product.id || product._id">
        <div class="product-card">
          <!-- DISCOUNT BADGE (Handles String/Number types safely) -->
          <span
            v-if="Number(product.oldPrice) > Number(product.price)"
            class="discount-badge"
          >
            -{{ getDiscount(product.oldPrice, product.price) }}%
          </span>

          <RouterLink :to="{ name: 'ShowDetails', params: { id: product.id || product._id } }">
            <div class="image-wrapper">
              <img :src="product.image" alt="product image" />
            </div>
          </RouterLink>

          <div class="card-content">
            <RouterLink
              :to="{ name: 'ShowDetails', params: { id: product.id || product._id } }"
            >
              <p class="title">
                {{ truncate(product.name, 25) }}
              </p>
            </RouterLink>

            <div class="rating-box mb-2">
              <div class="d-flex align-items-center gap-1">
                <span
                  class="stars text-warning small"
                  style="font-size: 0.8rem; color: #ffc107"
                >
                  <i
                    v-for="star in 5"
                    :key="star"
                    :class="getStarClass(product.averageRating || product.rating || 0, star)"
                  ></i>
                </span>
                <span class="text-muted ms-1" style="font-size: 0.75rem">
                  ({{
                    product.averageRating
                      ? product.averageRating.toFixed(1)
                      : (product.rating ? Number(product.rating).toFixed(1) : "0.0")
                  }})
                </span>
              </div>
            </div>

            <!-- PRICE -->
            <div class="price-box">
              <span class="price">
                {{ formatPrice(product.price) }}
              </span>

              <span v-if="Number(product.oldPrice) > Number(product.price)" class="old-price">
                {{ formatPrice(product.oldPrice) }}
              </span>
            </div>

            <p class="brand">
              <strong>Brand:</strong>
              {{ truncate(product.brand || "Unknown", 15) }}
            </p>

            <!-- ADMIN ACTIONS -->
            <div v-if="$route.name === 'AdminProduct'" class="actions">
              <RouterLink
                :to="{ name: 'EditProduct', params: { id: product.id || product._id } }"
              >
                <button class="btn edit">Edit</button>
              </RouterLink>

              <RouterLink
                :to="{ name: 'GalleryUpload', params: { id: product.id || product._id } }"
              >
                <button class="btn upload">Upload</button>
              </RouterLink>

              <button class="btn delete" @click="deleteProduct(product.id || product._id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script>
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";

export default {
  name: "FeaturedCarousel",
  components: { Swiper, SwiperSlide },

  props: {
    count: {
      type: Number,
      default: 20,
    },
    baseURL: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      products: [],
      loading: true,
      breakpoints: {
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      },
    };
  },

  methods: {
    getStarClass(avgRating, starIndex) {
      if (avgRating >= starIndex) {
        return "bi bi-star-fill";
      } else if (avgRating >= starIndex - 0.5) {
        return "bi bi-star-half";
      } else {
        return "bi bi-star";
      }
    },

    featured() {
      this.loading = true;
      axios
        .get(`${this.baseURL}products/get/featured/${this.count}`)
        .then((res) => {
          this.products = res.data;
        })
        .catch((err) => {
          console.error("Failed to load featured products:", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    formatPrice(value) {
      if (!value) return "₦0";
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(value);
    },

    truncate(text, length) {
      if (!text) return "";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },

    getDiscount(oldPrice, newPrice) {
      const oldP = Number(oldPrice);
      const newP = Number(newPrice);
      if (!oldP || oldP <= newP) return 0;
      return Math.round(((oldP - newP) / oldP) * 100);
    },

    deleteProduct(id) {
      // ✅ Fixed backend endpoint to match Express router.delete("/:id")
      axios
        .delete(`${this.baseURL}products/${id}`)
        .then(() => {
          this.products = this.products.filter((p) => (p.id || p._id) !== id);
        })
        .catch((err) => console.error("Delete failed:", err));
    },
  },

  mounted() {
    this.featured();
  },

  setup() {
    return {
      modules: [Navigation, Autoplay],
    };
  },
};
</script>

<style scoped>
.featured-wrapper {
  margin: 0;
}

.product-card {
  line-height: 1.4;
  position: relative;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  transition: 0.3s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  transform: translateY(-5px);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #dc3545;
  color: #fff;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 4px;
  z-index: 10;
}

.image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 10px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.price-box {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.price {
  font-weight: bold;
  color: #000;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.brand {
  font-size: 12px;
  color: #777;
}

.actions {
  margin-top: 10px;
  display: flex;
  gap: 5px;
}

.btn {
  flex: 1;
  font-size: 11px;
  padding: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn.edit {
  background: #007bff;
  color: #fff;
}

.btn.upload {
  background: #6c757d;
  color: #fff;
}

.btn.delete {
  background: #dc3545;
  color: #fff;
}
</style>