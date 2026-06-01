

<template>
   <Navbar :cartCount="cartCount" @resetCartCount="resetCartCount"/>
  <RouterView v-if="categories && products" style="min-height:60vh;"
  :baseURL="baseURL"
  :categories="categories"
  @category-deleted="removeCategory"
  :products="products"
  @product-deleted="removeProduct"
  @fetchData="fetchData"
  >
</RouterView>
  <!--            footer        -->
              <Footer /> 
</template>

<script>
import { useCartStore } from "./stores/CartStore";
import {useAuthStore} from "./stores/auth"
import axios from "axios";
import Navbar from "./views/Category/Navbar.vue";
import Footer from "./components/Footer.vue";
import Cart from "./views/Cart.vue";
export default {
  name:"Category",
  components:{Footer,Navbar,Cart},
  data(){
    return {
    baseURL:"https://royalgoods.onrender.com/api/v1/",
     //baseURL: "http://localhost:3000/api/v1/",
      products:null,
      categories:null,
      cartCount:0
      
    }
  },
  
  
  methods: {
  async fetchData() {
    //api call to get all the categories

    await axios.get(this.baseURL + "categories/")
    .then(res=> {
      this.categories=res.data
    }).catch((err)=>console.log('err',err));

    //api call to get the product

    await axios.get(this.baseURL + "products/")
    .then(res=> {
      this.products=res.data
    }).catch((err)=>console.log('err',err));
      
  },

  removeProduct(deletedId){
    this.products=this.products.filter(p => p.id !== deletedId)
  },

  removeCategory(deletedId){
    this.categories=this.categories.filter(c => c.id !== deletedId)
  },
  
  

    resetCartCount(){
      this.cartCount=0
    }
  
}, 

mounted(){
  const authStore=useAuthStore();
  authStore.loadFromStorage();

  const userId=localStorage.getItem('userId');
  if(userId){
    const cartStore=useCartStore();
    cartStore.loadCartForUser(userId);
  }

  this.token=localStorage.getItem('token');
 this.fetchData();

 setInterval(()=>{
  authStore.checkTokenAndLogoutIfExpired();
 },60000)
 

},

}
  
</script>



<style scoped>
html{
  overflow:scroll;
}
</style>
