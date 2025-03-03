<template>
    <div class="container">
        <div class="row">
            <div class="col-12 text-center">
            <h4>our product</h4>
            <RouterLink :to="{name:'AddProduct'}" >
            <button class="btn" style="float:right">
                Add product
            </button>
            </RouterLink>
        </div>
        </div>
        <div class="row">
            <!--display all the product-->
            <div v-for="product of products" :key="product.id" 
            class="col-md-6 col-xl-4 col-12  pt-3 d-flex">
                <ProductBox :product="product"/>
            </div>
        </div>
    </div>
</template>
<script>
import ProductBox from "@/components/CategoryBox/ProductBox.vue";

export default{
    name:'Product',
    components:{ProductBox},
    props:["products"],
    data() {
    return {
    };
  },
}
</script>

<style scope>
</style>