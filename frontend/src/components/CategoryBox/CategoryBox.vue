<template>
  <div class="card img-fluid" style="m">
    <div class="embed-responsive embed-responsive-10px">
      <RouterLink :to="{ name: 'ListProduct', params: { id: category.id } }">
      <img
        :src="category.image"
        class="card-img-top"
        alt="..."
      />
    </RouterLink>
    </div>
    <div class="card-body">
      <RouterLink :to="{ name: 'ListProduct', params: { id: category.id } }">
        <h5 class="card-title">{{ category.name }}</h5>
      </RouterLink>
      <p class="card-text">{{ category.icon.substring(0, 25) }}...</p>
      <RouterLink
        :to="{ name: 'EditCategory', params: { id: category.id } }"
        v-show="$route.name == 'Category'"
      >
        <button class="btn btn-primary">Edit</button>
      </RouterLink>
    </div>
  </div>
</template>
<script>
export default {
  name: "CategoryBox",
  props: ["category"],
  methods: {},
};
</script>

<style scope>
.card-img-top {
  object-fit: cover;
  max-width: 100%;
  max-height: 300px;
}
.card-body {
  margin-bottom: -5px;
  line-height: 0;
}
</style>
