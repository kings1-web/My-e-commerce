import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddCategory from '../views/AddCategory.vue'
import Category from '../views/Category/Category.vue'
import Product from '../views/Category/Product/Product.vue'

import Admin from '../views/Admin.vue'
import AddProduct from '@/views/Category/Product/AddProduct.vue'
import EditCategory from '@/views/Category/EditCategory.vue'
import EditProduct from '@/views/Category/Product/EditProduct.vue'
import ShowDatail from '@/views/Category/Product/ShowDatail.vue'
import ListProduct from '@/views/Category/ListProduct.vue'
import SignUp from '@/views/SignUp.vue'
import Login from '@/views/Login.vue'
import Cart from '@/views/Cart.vue'
import Page from '@/views/Category/Page.vue'
import CheckOut from '@/views/CheckOut.vue'
import Success from '@/views/payment/Success.vue'
import Failure from '@/views/payment/Failure.vue'
import BillingAddress from '@/components/BillingAddress.vue'
import { useAuthStore } from '@/stores/auth'
import UserOrders from '@/views/UserOrders.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
     //category detail page
     {
      path:'/category/show/:id?',
      name:'ListProduct',
      component:ListProduct
    },
    {
      path: '/admin/category/add',
      name: 'AddCategory',
      component:AddCategory,
    },
    {
      path: '/admin/product/add',
      name: 'AddProduct',
      component:AddProduct,
    },
    {
      path: '/admin/category',
      name: 'Category',
      component:Category,
    },
    {
      path: '/admin/product',
      name: 'AdminProduct',
      component:Product,
    },
    {
      path: '/user/order',
      name: 'UserOrders',
      component:UserOrders,
    },
    {
      path: '/BillingAddress',
      name: 'BillingAddress',
      component:BillingAddress,
    },
    //category edit
    {
      path: '/admin/category/:id',
      name: 'EditCategory',
      component:EditCategory,
    },
    //edit product
    {
      path: '/admin/product/:id',
      name: 'EditProduct',
      component:EditProduct,
    },
    //Admin page
    {
      path:'/admin',
      name:'Admin',
      component:Admin,
      meta:{requiresAdmin:true}
    },
      //show detail product
    {
      path:'/product/show/:id',
      name:'ShowDetails',
      component:ShowDatail
    },
    {
      path:'/signup',
      name:'SignUp',
      component:SignUp
    },
    {
      path:'/login',
      name:'Login',
      component:Login
    },
    {
      path:'/cart',
      name:'Cart',
      component:Cart
    },
    {
      path:'/payment/success',
      name:'PaymentSuccess',
      component:Success
    },
    {
      path:'/payment/failure',
      name:'PaymentFailure',
      component:Failure
    },
    {
      path:'/checkout',
      name:'CheckOut',
      component:CheckOut
    },
    
    {
      path:'/:pathMatch(.*)*',
      component:Page
    }
  ],
})

router.beforeEach((to, from, next)=>{
  const authStore=useAuthStore();
  if(to.meta.requiresAuth && !authStore.token){
    next('/login');
  }else if(to.meta.requiresAdmin && !authStore.isAdmin){
    next('/not-authorized');
  }else{
    next();
  }
})

export default router
