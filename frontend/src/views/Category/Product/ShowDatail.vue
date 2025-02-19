<template>
  <div class="container">
    <div class="row pt-5">
      <div class="col-md-1"></div>
      <!--display image-->
      <div class="col-md-4 col-12">
        <img :src="product.image" class="img-fluid" />
      </div>
      <!--disply product detail-->
      <div class="col-md-6 col-12 pt-3 pt-md-0">
        <h4>{{ product.name }}</h4>
        <h6 class="category fst-italic">{{ category.name }}</h6>
        <h6 class="fw-bold">price {{ product.price }}</h6>
        <p>
          {{ product.discription }}
        </p>
        <div class="d-flex flex-row justify-content-between">
          <div class="input-group col-md-3 col p-0">
            <div class="input-group-">
              <span class="input-group-text">quantity</span>
            </div>
            <div class="col-6">
              <input type="number" class="form-control"  v-model="quantity" />
            </div>
        </div>
          <div class="input-group col-md-3 col p-0" >
            <button>
             <a :href="product.brand" target="_blank" rel="noopener noreferrer">BUY NOW</a>
            </button>
           <!-- <button class="btn" 
            id="add-to-cart-button" 
            @click="addToCart">
              Add to Cart
            </button>-->
            </div>
          </div>
        <div class="features pt-3">
          <h5><strong>features</strong></h5>
          <ul>
          <li style="white-space: pre-line;">{{ product.richDiscription }} </li>
            
          </ul>
        </div>
       
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data(){
    return {
      product:{},
     category: {},
     token:null,
      quantity:1,
    }
  },

  watch:{
    cart:{
      handler(newCart){
        localStorage.setItem('cart',JSON.stringify(newCart))
      },
      deep:true
    }
  },
 
      props: ["baseURL","categories","products"],
      
   methods: {
    addToCart(item){
     if(!this.token){
      this.$swal({
        text:"please login to add item",
        icon:"error"
      });
      return;
     }
     
     //add to cart
   axios.post(`${this.baseURL}orders?token=${this.token}`,{
      orderItems:[{product:this.product,
        quantity:this.quantity}]
     }).then((res)=>{
      if(res.status==200){
        this.$swal({
        text:"product added successfully (proceed to cart to complete order)",
        icon:"success"
      });
     this.$emit("fetchData")
      }
     }).catch((err)=> console.log('err',err))
 
    },
  /*  optimizeImage(imagePublicId){
    return `https://res.cloudinary.com/b9n3gfzv/image/upload/w_800,h_800,c_limit,f_auto/${imagePublicId}`
   }*/
    },
   
  
      mounted() {
        
     this.id = this.$route.params.id;
     this.product = this.products.find((product) => product.id == this.id);
     this.category = this.categories.find(
      (category) => category.id == this.product.category.id);
     this.token = localStorage.getItem("token");
      },
    
  }
</script>
<style scoped>
.category {
  font-weight: 400;
}
#wishlist-button {
  background-color: #b9b9b9;
}
#add-to-cart-button {
  background-color:orangered;
}
.form-control{
  width:4;
}
</style>
