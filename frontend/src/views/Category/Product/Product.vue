<template>
    <div class="container mt-4">
        <div class="row">
            <div class="col-12 text-center">
            <h4>our product</h4>
            <button class="btn" style="float:right">
            <RouterLink :to="{name:'AddProduct'}" >
                
                Add product
            </RouterLink></button>
        </div>
        </div>
        <div class="row">
            <!--display all the product-->
            <div v-for="product of products" :key="product.id" 
            class="col-md-6 col-xl-3 col-12  pt-0 d-flex">
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
 .card-img-top{
    object-fit: cover;
   }
</style>