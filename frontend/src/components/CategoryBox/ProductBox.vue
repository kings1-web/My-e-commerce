<template>
  <div class="card img-fluid">
    <div class="embed-responsive embed-responsive-10px">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
      <img :src="product.image" class="card-img-top" alt="..." />
      </router-link>
    </div>
    <div class="card-body">
      <router-link :to="{ name: 'ShowDetails', params: { id: product.id } }">
        <h5 class="card-title">{{ product.name.substring(0, 25) }}</h5>
      </router-link>
      <p style="color:blue-sky;" class="card-text text-wrap">₦{{ product.price }}</p>
      <p style="font-weight: 900;" class="card-text text-wrap">BRAND:{{ product.brand.substring(0,10) }}</p>
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
p #bg{
  background:red;
  font-size: 20px;
}
</style>
