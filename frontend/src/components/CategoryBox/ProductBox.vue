<template>
  <div class="card img-fluid">
    <div class="embed-responsive embed-responsive-10px">
      <img :src="product.image" class="card-img-top" alt="..." />
    </div>
    <div class="card-body p-1 my-2">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
        <h5 class="card-title">{{ product.name }}</h5>
      </router-link>
      <p class="card-text">{{ product.discription.substring(0, 65) }}...</p>
      <RouterLink
        :to="{ name: 'EditProduct', params: { id: product.id } }"
        v-show="$route.name == 'AdminProduct'"
      >
        <button class="btn btn-primary">Edit</button>
      </RouterLink>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductBox",
  props: ["product"],
  methods: {},
};
</script>
<style scoped>
.card-img-top {
  object-fit: cover;
  max-width: 100%;
  max-height: 300px;
}
a {
  text-decoration: none;
}
.card-title {
  color: #484848;
}
.card-title:hover {
  color: orangered;
}
.card-body {
  margin-bottom: -5px;
  line-height: 0;
}
</style>
