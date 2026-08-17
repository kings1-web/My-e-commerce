<template>
  <div class="container py-4">
    <div class="row mb-3 align-items-center">
      <div class="col-8">
        <h4 class="mb-0">Our Products</h4>
      </div>
      <div class="col-4 text-end">
        <RouterLink :to="{ name: 'AddProduct' }">
          <button class="btn btn-primary">
            Add Product
          </button>
        </RouterLink>
      </div>
    </div>

    <div class="row">
      <!-- DISPLAY ALL PRODUCTS -->
      <div
        v-for="product in products"
        :key="product.id || product._id"
        class="col-md-6 col-xl-4 col-12 pt-3 d-flex"
      >
        <ProductBox
          :product="product"
          @product-deleted="$emit('product-deleted', $event)"
        />
      </div>

      <!-- EMPTY STATE FALLBACK -->
      <div v-if="!products || products.length === 0" class="col-12 text-center py-5">
        <p class="text-muted">No products found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProductBox from "@/components/CategoryBox/ProductBox.vue";

export default {
  name: "ProductList",
  components: { ProductBox },
  props: {
    products: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["product-deleted"],
};
</script>

<style scoped>
.btn-primary {
  background-color: #0d6efd;
  color: #fff;
}
</style>