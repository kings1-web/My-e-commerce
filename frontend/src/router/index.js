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
import Success from '@/views/payment/Success.vue'
import Failure from '@/views/payment/Failure.vue'
import BillingAddress from '@/components/BillingAddress.vue'
import { useAuthStore } from '@/stores/auth'
import UserOrders from '@/views/UserOrders.vue'
import GalleryUpload from '@/views/GalleryUpload.vue'
import FeaturedCarousel from '@/components/FeaturedCarousel.vue'
import InstallerRegister from "@/views/InstallerRegister.vue";
import InstallerLogin from "@/views/InstallerLogin.vue";
import StarRating from '@/components/StarRating.vue'
import Installers from '@/views/Installers.vue'
import { useInstallerStore } from "@/stores/installer";

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
    //gallery 
    {
      path:'/product/gallery/:id?',
      name:'GalleryUpload',
      component:GalleryUpload
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
    {
      path: '/Featured',
      name: 'Featured',
      component:FeaturedCarousel,
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
  path: "/installers",
  component: Installers
},

    {
  path: "/installer-register",
  component: InstallerRegister
},
{
  path: "/installer-login",
  name:InstallerLogin,
  component: InstallerLogin,
   meta: { guestOnly: true } // Tagging this so logged-in installers can't access
},
{
  path: "/installer/:id",
  name: "InstallerProfile",
  component: () => import("@/views/InstallerProfile.vue"),
  props: true // Automatically passes the :id parameter into the component as a prop
},

{
  path: "/RatingReview",
  name:"StarRating",
  component: StarRating
},
   {
  path: "/installer-dashboard",
  name:"InstallerDashboard",
  component: () => import("@/views/InstallerDashboard.vue"),
  meta: { requiresInstaller: true }
},
{
  path: "/workspace/chat/:requestId",
  name: "WorkspaceChat",
  component: () => import("@/views/WorkspaceChat.vue"),
  props: true, // Passes requestId into the component as a prop automatically
  meta: { requiresAuth: true } // Keeps the chat protected
},
// Inside your frontend src/router/index.js file
{
  path: "/dashboard",
  name: "UserDashboard",
  component: () => import("@/views/UserDashboard.vue"),
  meta: { requiresAuth: true } // Guarantees route protection mechanics layer
},


    {
      path:'/:pathMatch(.*)*',
      component:Page
    },

  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const InstallerStore=useInstallerStore();

  const installerToken = localStorage.getItem("installerToken");

  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } 
  else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/not-authorized');
  } 
  else if (to.meta.requiresInstaller && !InstallerStore.installer) {
    next('/installer-login');
  } 
  else {
    next();
  }
});




export default router
