<template>
  <div class="product-card">
    <!-- IMAGE -->
    <RouterLink :to="{ name: 'ListProduct', params: { id: category.id } }">
      <div class="image-wrapper">
        <img
          :src="category.image || fallbackImage"
          alt="category image"
        />
      </div>
    </RouterLink>

    <!-- CONTENT -->
    <div class="card-content">
      <RouterLink :to="{ name: 'ListProduct', params: { id: category.id } }">
        <h5 class="title">
          {{ category.name || 'No Name' }}
        </h5>
      </RouterLink>

      <p class="desc">
        {{ category.icon || 'No description' }}
      </p>

      <!-- ACTIONS -->
      <div
        class="actions"
        v-if="$route.name === 'Category'"
      >
        <RouterLink :to="{ name: 'EditCategory', params: { id: category.id } }">
          <button class="btn edit">Edit</button>
        </RouterLink>

        <button class="btn delete" @click="deleteCategory">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CategoryBox",
  props: ["category"],

  data() {
    return {
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/" || "https://royalgoods.onrender.com/api/v1/",
      fallbackImage: "https://via.placeholder.com/300x200?text=No+Image",
    };
  },

  methods: {
    async deleteCategory() {
      if (!confirm("Are you sure you want to delete this category?")) return;

      try {
        await axios.delete(
          `${this.baseURL}categories/${this.category.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // notify parent
        this.$emit("category-deleted", this.category.id);

        // success alert
        this.$swal({
          text: "Category deleted successfully",
          icon: "success",
        });
      } catch (err) {
        console.error("Error deleting category:", err);

        this.$swal({
          text: "Failed to delete category!",
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
  height: 180px;
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
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  font-size: 13px;
  color: #777;
  margin-bottom: 12px;

  height: 35px;
  overflow: hidden;
}

/* BUTTONS */
.actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
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

.btn.delete {
  background: #dc3545;
  color: white;
}

.btn.delete:hover {
  background: #a71d2a;
}
</style>
