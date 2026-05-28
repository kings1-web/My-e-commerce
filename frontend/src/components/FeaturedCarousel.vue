
 <template>
  <div class="featured-wrapper">

    <Swiper
      :modules="modules"
      :slides-per-view="2"
      :space-between="15"
      :breakpoints="breakpoints"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      :loop="true"
      class="mySwiper"
    >
      <SwiperSlide
        v-for="product in products"
        :key="product.id"
      >
        <div class="product-card">
          <!-- DISCOUNT BADGE -->
          <span
            v-if="product.oldPrice && product.oldPrice > product.price"
            class="discount-badge"
          >
            -{{ getDiscount(product.oldPrice, product.price) }}%
          </span>

          <RouterLink :to="{ name: 'ShowDetails', params: { id: product.id } }">
            <div class="image-wrapper">
              <img :src="product.image" alt="product image" />
            </div>
          </RouterLink>

          <div class="card-content">
            <RouterLink :to="{ name: 'ShowDetails', params: { id: product.id } }">
              <p class="title">
                {{ truncate(product.name, 25) }}
              </p>
            </RouterLink>

            <!-- PRICE -->
            <div class="price-box">
              <span class="price">
                {{ formatPrice(product.price) }}
              </span>

              <span
                v-if="product.oldPrice"
                class="old-price"
              >
                {{ formatPrice(product.oldPrice) }}
              </span>
            </div>

            <p class="brand">
              <strong>Brand:</strong> {{ truncate(product.brand, 15) }}
            </p>

            <!-- ADMIN ACTIONS -->
            <div
              v-if="$route.name === 'AdminProduct'"
              class="actions"
            >
              <RouterLink :to="{ name: 'EditProduct', params: { id: product.id } }">
                <button class="btn edit">Edit</button>
              </RouterLink>

              <RouterLink :to="{ name: 'GalleryUpload', params: { id: product.id } }">
                <button class="btn upload">Upload</button>
              </RouterLink>

              <button class="btn delete" @click="deleteProduct(product.id)">
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

// SWIPER
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
      breakpoints: {
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      },
    };
  },

  methods: {
    featured() {
      axios
        .get(`${this.baseURL}products/get/featured/${this.count}`)
        .then((res) => {
          this.products = res.data;
        })
        .catch((err) => {
          console.error("Failed to load featured products:", err);
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
      return text.length > length
        ? text.substring(0, length) + "..."
        : text;
    },

    // 🔥 NEW: DISCOUNT CALCULATION
    getDiscount(oldPrice, newPrice) {
      return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    },

    deleteProduct(id) {
      axios
        .delete(`${this.baseURL}products/delete/${id}`)
        .then(() => {
          this.products = this.products.filter((p) => p.id !== id);
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
  margin: 0px 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
}

/* CARD */
.product-card {
  position: relative;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  transition: 0.3s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.product-card:hover {
  transform: translateY(-5px);
}

/* 🔥 DISCOUNT BADGE */
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

/* IMAGE */
.image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.image-wrapper img {
  max-width: 100%;
  height: 100%;
  object-fit: cover;
}

/* CONTENT */
.card-content {
  padding: 10px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

/* PRICE */
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

/* BUTTONS */
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

