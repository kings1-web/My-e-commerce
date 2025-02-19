<template>
    <div class="container">
        <div class="row">
        <div class="col-12 text-center">
            <h4 class="pt-3">{{ category.name }}</h4>
            <h5 style="font-weight:300; color:#686868">{{ msg }}</h5>
        </div>
        </div>
        <div class="row">
            <div v-for="product  of product" :key="product.id"
            class="col-md-6 col-xl-4 col-12 pt-3 justify-content-around d-flex">
           <ProductBox :product="product" />
        </div>
        </div>
    </div>
</template>

<script>
import ProductBox from '@/components/CategoryBox/ProductBox.vue';
import axios from 'axios';
 export default{
    components:{ProductBox},
    data(){
        return{
         id:null,
         category:{},
         product:[],
         msg:''

        }
    },
    props:["categories","baseURL","products"],
    
              
    mounted(){
      this.id=this.$route.params.id;
       this.category=this.categories.find(category => category.id == this.id);
        this.product=this.products.filter(product=>product.category.id == this.id)
        if(this.product.lenght == 0){
            this.msg =" = no product found"
        }else if(this.product.length == 1){
            this.msg =" = only 1 product found"
        }else{
            this.msg =this.product.length + " = products found"
    console.log('id',this.id)

        }
    }

 }
</script>