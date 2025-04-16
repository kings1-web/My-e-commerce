<template>

 <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <RouterLink class="navbar-brand" style="color:orangered" :to="{name:'home' }">
      ROYAL-GOODS
    </RouterLink>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <form class="d-flex" role="search">
        <input class="form-control me-2" size="150" type="search" id="input-button" placeholder="Search products,category and brands" aria-label="Search"/>
        <button class="btn btn-outline-success" id="search-button-navbar" type="submit"><i class="bi bi-search" style="color:white"></i></button>
      </form>
      <div id="cart" style="position:relative;color:white;padding-left:10px;">
            <span id="nav-cart-count">{{ cartCount }}</span>
            <RouterLink class="text-light" :to="{name: 'Cart'}">
              <i class="bi bi-cart4" style="font-size:20px;"></i>
            </RouterLink> 
           
          </div>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle text-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Browse
          </a>
          <ul class="dropdown-menu">
            <li><RouterLink class="dropdown-item" :to="{name:'home'}">
              Home
            </RouterLink></li>
            <li><RouterLink class="dropdown-item" :to="{name:'UserOrders'}">
              Orders
            </RouterLink></li>
            <li><RouterLink class="dropdown-item" :to="{name:'Admin'}">
              AdminPanel
            </RouterLink></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle text-light" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          
            Account
          </a>
          <ul class="dropdown-menu">
            <li><RouterLink v-if="!token" class="dropdown-item" :to="{name:'SignUp'}">
              SignUp
            </RouterLink></li>
            <li><RouterLink v-if="!token" class="dropdown-item" :to="{name:'Login'}">
              Sign In
            </RouterLink></li>
            <li><a  v-if="token" class="dropdown-item" href="#" @click="logout">
              Sign Out
            </a></li>
          </ul>
        </li>
       
      </ul>
    </div>
    
  </div>
</nav>

</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/CartStore";
import { mapState } from "pinia";
export default {
  name: "Navbar",
  data() {
    return{
      token:null,
    }
  },
  methods:{
    logout(){
      localStorage.removeItem('token');
      localStorage.removeItem('uderId');
      localStorage.removeItem('isAdmin');
      this.token=null
      this.$swal({
        text:"logged out successfully, visit again",
        icon:"success"
      })
      const cartStore = useCartStore();
        cartStore.resetCart();
      this.$router.push({ name: "home" });
    },
  },
  computed:{
    ...mapState(useCartStore,['cartCount'])
  },
  mounted() {
    this.$emit('updateCart')
    this.token = localStorage.getItem("token");
  },
 
};
</script>
<style scoped>
#search-button-navbar{
  background-color:red;
  border-color:orangered ;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
#input-button{
  border-color: red ;
}
#nav-cart-count{
  background-color:red;
  color:white;
  border-radius:50%;
  height:15px;
  width:15px;
  font-size:15px;
  align-items:center;
  display:flex;
  justify-content:center;
  position:absolute;
  margin-left:10px
}
</style>
