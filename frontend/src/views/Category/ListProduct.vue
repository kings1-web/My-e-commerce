<template>
  <div class="container my-4">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12 text-center">
        <h3 class="fw-bold text-dark text-capitalize mb-1">
          {{ category?.name || "Category Products" }}
        </h3>
        <p class="text-muted fw-normal fs-6 mb-0">
          {{ msg }}
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="productsList.length === 0"
      class="row justify-content-center my-5"
    >
      <div class="col-md-6 text-center py-5 bg-light rounded border border-dashed">
        <p class="text-muted mb-0">No products available in this category yet.</p>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else class="row g-4">
      <div
        v-for="product in productsList"
        :key="product.id || product._id"
        class="col-12 col-md-6 col-xl-4 d-flex"
      >
        <ProductBox :product="product" class="w-100" />
      </div>
    </div>
  </div>
</template>

<script>
import ProductBox from "@/components/CategoryBox/ProductBox.vue";

export default {
  name: "ListProducts",
  components: {
    ProductBox,
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
    baseURL: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      id: null,
      category: null,
      productsList: [],
      msg: "",
    };
  },
  watch: {
    products: {
      handler: "initializeData",
      deep: true,
      immediate: true,
    },
    categories: {
      handler: "initializeData",
      deep: true,
      immediate: true,
    },
    "$route.params.id"(newId) {
      if (newId) {
        this.id = String(newId);
        this.initializeData();
      }
    },
  },
  methods: {
    initializeData() {
      if (!this.products || !this.categories) return;

      this.id = String(this.$route.params.id || "");

      // Flexible Category Resolution
      this.category =
        this.categories.find((c) => {
          const catId = c.id || c._id;
          return String(catId) === this.id;
        }) || null;

      // Flexible Product-Category Matching (handles both object & string references)
      this.productsList = this.products.filter((p) => {
        if (!p.category) return false;

        const prodCatId =
          typeof p.category === "object"
            ? p.category.id || p.category._id
            : p.category;

        return String(prodCatId) === this.id;
      });

      // Message Logic
      const count = this.productsList.length;
      if (count === 0) {
        this.msg = "No products found";
      } else if (count === 1) {
        this.msg = "1 product found";
      } else {
        this.msg = `${count} products found`;
      }
    },
  },
  mounted() {
    this.initializeData();
  },
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
</style>