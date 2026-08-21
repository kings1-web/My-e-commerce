<template>
   <!-- Top Products Grid -->
    <div class="container py-3">
      <div
        class="text-white bg-primary pt-2 py-2 px-3 rounded d-flex justify-content-between align-items-center"
      >
        <h3 id="shop-now" class="m-0 fs-4 fw-bold">🛒 All Products</h3>
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
</template>

<script>
import ProductBox from "@/components/CategoryBox/ProductBox.vue";
export default{
    name: "ProductPage",
  components: {
    ProductBox,
  },
  props:{
     products: {
      type: Array,
      default: () => [],
    },
    baseURL: String,
  },
  computed:{
  latestProducts() {
      if (!this.products || !this.products.length) return [];
      return [...this.products].reverse().slice(0,);
    },
  },
 
}
</script>

<style scoped>
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