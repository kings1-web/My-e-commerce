<template>
  <div class="product-card">
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
        <h5 class="title">
          {{ shortenText(product.name || 'No Name', 20) }}

        </h5>
      </RouterLink>

          <p>{{ shortenText(product.discription || 'No Description', 20) }}</p>


      <p class="price">
        {{ formatPrice(product.price) }}
      </p>

      <p class="brand">
        <strong>Brand:</strong>
        {{ product.brand || 'N/A' }}
      </p>

      <!-- ACTIONS (ADMIN ONLY) -->
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

        <button class="btn delete" @click="deleteProduct">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductBox",
  props: ["product"],

  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/" || "https://royalgoods.onrender.com/api/v1/",
      fallbackImage: "https://via.placeholder.com/300x200?text=No+Image",
    };
  },

  methods: {

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
        maximumFractionDigits: 2,
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

        this.$swal({
          text: "Product deleted successfully",
          icon: "success",
        });
      } catch (err) {
        console.error("Error deleting product:", err);

        this.$swal({
          text: "Failed to delete product!",
          icon: "error",
        });
      }
    },
  },
};
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* IMAGE */
.image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-wrapper img {
  
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.image-wrapper:hover img {
  transform: scale(1.1);
}

/* CONTENT */
.card-content {
  padding: 15px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  color: #111;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
}

.brand {
  font-size: 13px;
  color: #777;
  margin-bottom: 12px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ACTION BUTTONS */
.actions {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.btn {
  flex: 1;
  border: none;
  padding: 6px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.btn.edit {
  background: #007bff;
  color: white;
}

.btn.edit:hover {
  background: #0056b3;
}

.btn.upload {
  background: #6c757d;
  color: white;
}

.btn.upload:hover {
  background: #545b62;
}

.btn.delete {
  background: #dc3545;
  color: white;
}

.btn.delete:hover {
  background: #a71d2a;
}

a {
  text-decoration: none;
}
</style>