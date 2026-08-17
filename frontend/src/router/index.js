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
     meta: { requiresAuth: true, isAdminRoute: true }
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
  path: '/verify-payment',
  name: 'VerifyPayment',
  component: () => import('@/views/VerifyPayment.vue')
},
    {
  path: "/installers",
  component: Installers
},

   // Inside your frontend src/router/index.js routes configuration array
{
  path: "/become-an-installer",
  name: "BecomeInstaller",
  component: () => import("@/views/InstallerRegister.vue")
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
  meta: { requiresAuth: true, isInstallerRoute: true } 
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

  // 🟢 CASE 1: Route requires standard customer/buyer authentication profile context
  if (to.matched.some(record => record.meta.requiresAuth)) {
    
    if (!authStore.token) {
      // If no token exists at all across your application, kick them to your main login page
      return next({ name: "Login" });
    }
    
    // 🟢 CASE 2: Route requires specialized INSTALLER role checking boundaries
    if (to.matched.some(record => record.meta.isInstallerRoute)) {
      // Check your unified roles array state rather than an old independent token string
      if (authStore.roles && authStore.roles.includes("installer")) {
        return next(); // Unblocked access allowed!
      } else {
        alert("Access Denied: Your profile accounts lacks approved Technician authorization privileges.");
        return next({ name: "UserDashboard" }); // Gracefully redirect back to their client dashboard
      }
    }

    // 🟢 CASE 3: Route requires specialized ADMIN role checking boundaries
    if (to.matched.some(record => record.meta.isAdminRoute)) {
      if (authStore.roles && authStore.roles.includes("admin") || authStore.isAdmin) {
        return next();
      } else {
        alert("Access Denied: Administrative authority clearance required.");
        return next({ name: "UserDashboard" });
      }
    }

    next(); // Pass through cleanly
  } else {
    next(); // Public routes bypass completely
  }
});





export default router
