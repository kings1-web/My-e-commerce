<template>
  <div class="container my-4">
    <!-- Header Row -->
    <div class="row align-items-center mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h3 class="fw-bold text-dark text-capitalize mb-0">Our Categories</h3>
        <RouterLink :to="{ name: 'AddCategory' }">
          <button type="button" class="btn btn-primary fw-semibold shadow-sm">
            + Add Category
          </button>
        </RouterLink>
      </div>
    </div>

    <!-- Category Grid -->
    <div class="row g-4">
      <div
        v-for="category in categories"
        :key="category.id || category._id"
        class="col-12 col-md-6 col-xl-4 d-flex"
      >
        <CategoryBox
          :category="category"
          class="w-100"
          @category-deleted="$emit('category-deleted', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CategoryBox from "@/components/CategoryBox/CategoryBox.vue";

export default {
  name: "Category",
  components: {
    CategoryBox,
  },
  props: {
    categories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ["category-deleted"],
};
</script>

<style scoped>
/* Optional scoped tweaks if needed */
</style>