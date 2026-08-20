<template>
  <div class="product-card w-100 d-flex flex-column justify-content-between">
    <div>
      <!-- IMAGE -->
      <RouterLink :to="{ name: 'ShowDetails', params: { id: product.id } }">
        <div class="image-wrapper">
          <img
            :src="product.image || fallbackImage"
            alt="product image"
          />
        </div>
      </RouterLink>

      <!-- CONTENT -->
      <div class="card-content">
        <RouterLink :to="{ name: 'ShowDetails', params: { id: product.id } }">
          <h5 class="title m-0">
            {{ shortenText(product.name || 'No Name', 22) }}
          </h5>
        </RouterLink>

        <!-- RATING CONTAINER -->
        <div class="rating-container my-1">
          <div class="d-flex align-items-center gap-1">
            <span class="stars text-warning small">
              <i 
                v-for="star in 5" 
                :key="star" 
                :class="getStarClass(product.averageRating || 0, star)"
              ></i>
            </span>
            <span class="text-muted text-xs ms-1">
              ({{ product.averageRating ? product.averageRating.toFixed(1) : '0.0' }})
            </span>
          </div>
        </div>

        <p class="description text-muted small my-1">
          {{ shortenText(product.discription || 'No Description', 25) }}
        </p>

        <p class="price my-1">
          {{ formatPrice(product.price) }}
        </p>

        <p class="brand text-muted small mb-2">
          <strong>Brand:</strong> {{ product.brand || 'Generic' }}
        </p>
      </div>
    </div>

    <!-- 🟢 DIRECT BUY BUTTONS (Reduces friction for instant purchases) -->
    <div class="px-3 pb-3 pt-0">
      <div class="d-flex flex-column gap-2">
        <button 
          class="btn btn-primary btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
          @click="addToCart"
        >
          <i class="bi bi-cart-plus"></i> Add to Cart
        </button>
        
        <a 
          :href="whatsappOrderUrl" 
          target="_blank" 
          class="btn btn-outline-success btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
        >
          <i class="bi bi-whatsapp"></i> Buy via WhatsApp
        </a>
      </div>

      <!-- ACTIONS (ADMIN ONLY) -->
      <div
        v-if="$route.name === 'AdminProduct'"
        class="actions mt-2 pt-2 border-top"
      >
        <RouterLink :to="{ name: 'EditProduct', params: { id: product.id } }">
          <button class="btn edit">Edit</button>
        </RouterLink>

        <RouterLink :to="{ name: 'GalleryUpload', params: { id: product.id } }">
          <button class="btn upload">Upload</button>
        </RouterLink>

        <button class="btn delete" @click="deleteProduct">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useCartStore } from "@/stores/CartStore";

export default {
  name: "ProductBox",
  props: ["product"],

  data() {
    return {
      token:null,
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/",
      fallbackImage: "https://via.placeholder.com/300x200?text=No+Image",
    };
  },

  computed: {
    whatsappOrderUrl() {
      const text = encodeURIComponent(
        `Hello ShoppersFix, I want to order "${this.product.name}" priced at ${this.formatPrice(this.product.price)}.`
      );
      return `https://wa.me/2349018629904?text=${text}`;
    }
  },

  methods: {
    addToCart() {
      if (!this.token) {
        this.$swal({
          text: "Please login to add item",
          icon: "error",
        });
        return;
      }
      const cartStore = useCartStore();
      if (typeof cartStore.addToCart === "function") {
        cartStore.addToCart(this.product);
      }
      if (this.$swal) {
        this.$swal({
          text: `${this.product.name} added to cart!`,
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    },

    getStarClass(avgRating, starIndex) {
      if (avgRating >= starIndex) {
        return 'bi bi-star-fill';
      } else if (avgRating >= starIndex - 0.5) {
        return 'bi bi-star-half';
      } else {
        return 'bi bi-star';
      }
    },

    shortenText(text, length) {
      if (!text) return "";
      return text.length > length
        ? text.substring(0, length) + "..."
        : text;
    },

    formatPrice(value) {
      if (!value) return "₦0";
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(value);
    },

    async deleteProduct() {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        await axios.delete(
          `${this.baseURL}products/${this.product.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        this.$emit("product-deleted", this.product.id);

        if (this.$swal) {
          this.$swal({
            text: "Product deleted successfully",
            icon: "success",
          });
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        if (this.$swal) {
          this.$swal({
            text: "Failed to delete product!",
            icon: "error",
          });
        }
      }
    },
  },
   mounted() {
    this.token = localStorage.getItem("token");
  },
};
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-wrapper:hover img {
  transform: scale(1.05);
}

.card-content {
  padding: 12px 15px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.rating-container {
  display: flex;
  align-items: center;
}

.stars i {
  margin-right: 1px;
}

.text-xs {
  font-size: 11px;
}

.price {
  color: #d9534f;
  font-weight: 700;
  font-size: 16px;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.btn.edit {
  background: #007bff;
  color: white;
}

.btn.upload {
  background: #6c757d;
  color: white;
}

.btn.delete {
  background: #dc3545;
  color: white;
}

a {
  text-decoration: none;
}
</style>