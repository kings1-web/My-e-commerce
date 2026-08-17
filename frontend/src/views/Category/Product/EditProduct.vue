<template>
  <div class="container bg-dark text-white mt-4 py-4">
    <div class="row">
      <div class="col-12 text-center">
        <h4 class="pt-3">Edit Product</h4>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-8 col-12">
        <form
          class="row g-3 text-start py-4"
          v-if="product"
          @submit.prevent="editProduct"
        >
          <!-- CATEGORY -->
          <div class="form-group col-12">
            <label class="form-label">Category</label>
            <select class="form-select" v-model="selectedCategory" required>
              <option disabled value="">Select a Category</option>
              <option
                v-for="category in categories"
                :key="category.id || category._id"
                :value="category.id || category._id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- NAME -->
          <div class="form-group col-12">
            <label class="form-label">Name</label>
            <input
              type="text"
              class="form-control"
              v-model="product.name"
              required
            />
          </div>

          <!-- DESCRIPTION -->
          <div class="form-group col-12">
            <label class="form-label">Description</label>
            <input
              type="text"
              class="form-control"
              v-model="product.discription"
              required
            />
          </div>

          <!-- RICH DESCRIPTION / FEATURES -->
          <div class="form-group col-12">
            <label class="form-label">Rich Description</label>
            <textarea
              class="form-control"
              rows="3"
              v-model="product.richDiscription"
            ></textarea>
          </div>

          <!-- IMAGE -->
          <div class="form-group col-12">
            <label class="form-label">Update Image (Optional)</label>
            <input
              type="file"
              ref="image"
              name="image"
              @change="handleFileUpload"
              class="form-control"
              accept="image/*"
            />
          </div>

          <!-- BRAND -->
          <div class="form-group col-12">
            <label class="form-label">Brand</label>
            <input
              type="text"
              class="form-control"
              v-model="product.brand"
            />
          </div>

          <!-- PRICE -->
          <div class="form-group col-md-6 col-12">
            <label class="form-label">Price (₦)</label>
            <input
              type="number"
              class="form-control"
              v-model="product.price"
              required
            />
          </div>

          <!-- OLD PRICE -->
          <div class="form-group col-md-6 col-12">
            <label class="form-label">Original Price (Optional)</label>
            <input
              type="number"
              v-model="product.oldPrice"
              class="form-control"
              placeholder="e.g. 200000"
            />
          </div>

          <!-- COUNT IN STOCK -->
          <div class="form-group col-12">
            <label class="form-label">Count In Stock</label>
            <input
              type="number"
              class="form-control"
              v-model="product.countInStock"
              required
              min="0"
            />
          </div>

          <!-- IS FEATURED -->
          <div class="form-group col-12">
            <label class="form-label">Featured Product</label>
            <select v-model="product.isFeatured" class="form-select">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>

          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-primary w-100">
              UPDATE PRODUCT
            </button>
          </div>
        </form>

        <div v-else class="text-center py-5">
          <p>Loading product details...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EditProduct",
  props: ["baseURL", "categories", "products"],

  data() {
    return {
      product: null,
      selectedCategory: "",
      selectedFile: null,
      id: null,
    };
  },

  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },

    async editProduct() {
      const formData = new FormData();

      formData.append("name", this.product.name);
      formData.append("category", this.selectedCategory);
      formData.append("discription", this.product.discription || "");
      formData.append("richDiscription", this.product.richDiscription || "");

      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      formData.append("brand", this.product.brand || "");
      formData.append("price", this.product.price);
      formData.append("oldPrice", this.product.oldPrice || 0);
      formData.append("countInStock", this.product.countInStock);
      formData.append("isFeatured", this.product.isFeatured);

      try {
        await axios.put(`${this.baseURL}products/${this.id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.$emit("fetchData");
        this.$router.push({ name: "AdminProduct" });

        if (this.$swal) {
          this.$swal({
            text: "Product updated successfully!",
            icon: "success",
          });
        }
      } catch (err) {
        console.error("Product update error:", err.response ? err.response.data : err);
        if (this.$swal) {
          this.$swal({
            text: err.response?.data || "Failed to update product",
            icon: "error",
          });
        }
      }
    },

    async loadProductData() {
      // 1. Try finding in passed prop first
      if (this.products && this.products.length) {
        const rawProduct = this.products.find(
          (p) => (p.id || p._id) == this.id
        );
        if (rawProduct) {
          this.setProduct(rawProduct);
          return;
        }
      }

      // 2. Fallback fetch from API if direct page access/reload occurs
      try {
        const res = await axios.get(`${this.baseURL}products/${this.id}`);
        this.setProduct(res.data);
      } catch (err) {
        console.error("Failed to load target product details:", err);
      }
    },

    setProduct(data) {
      this.product = { ...data };
      this.selectedCategory =
        typeof this.product.category === "object" && this.product.category !== null
          ? this.product.category.id || this.product.category._id
          : this.product.category;
    },
  },

  mounted() {
    this.id = this.$route.params.id;
    this.loadProductData();
  },

  watch: {
    products: {
      handler() {
        if (!this.product) {
          this.loadProductData();
        }
      },
      immediate: true,
    },
  },
};
</script>