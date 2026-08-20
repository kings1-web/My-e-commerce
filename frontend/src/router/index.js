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
import About from "@/views/About.vue";
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
import ReturnPolicy from "@/views/ReturnPolicy.vue";
import Terms from "@/views/Terms.vue";
import PrivacyPolicy from "@/views/PrivacyPolicy.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition; // Preserves position when using back/forward buttons
    } else {
      return { top: 0 }; // Scrolls to the top on new page navigation
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: "/about",
      name: "About",
      component: About,
    },
    {
      path: "/return-policy",
      name: "ReturnPolicy",
      component: ReturnPolicy,
    },
    {
      path: "/terms",
      name: "Terms",
      component: Terms,
    },
    {
      path: "/privacy-policy",
      name: "PrivacyPolicy",
      component: PrivacyPolicy,
    },
    {
      path:'/category/show/:id?',
      name:'ListProduct',
      component:ListProduct
    },
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
    {
      path: '/admin/category/:id',
      name: 'EditCategory',
      component:EditCategory,
    },
    {
      path: '/admin/product/:id',
      name: 'EditProduct',
      component:EditProduct,
    },
    {
      path:'/admin',
      name:'Admin',
      component:Admin,
      meta: { requiresAuth: true, isAdminRoute: true }
    },
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
    {
      path: "/become-an-installer",
      name: "BecomeInstaller",
      component: () => import("@/views/InstallerRegister.vue")
    },
    {
      path: "/installer-login",
      name: InstallerLogin,
      component: InstallerLogin,
      meta: { guestOnly: true }
    },
    {
      path: "/installer/:id",
      name: "InstallerProfile",
      component: () => import("@/views/InstallerProfile.vue"),
      props: true
    },
    {
      path: "/RatingReview",
      name: "StarRating",
      component: StarRating
    },
    {
      path: "/installer-dashboard",
      name: "InstallerDashboard",
      component: () => import("@/views/InstallerDashboard.vue"),
      meta: { requiresAuth: true, isInstallerRoute: true }
    },
    {
      path: "/workspace/chat/:requestId",
      name: "WorkspaceChat",
      component: () => import("@/views/WorkspaceChat.vue"),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/dashboard",
      name: "UserDashboard",
      component: () => import("@/views/UserDashboard.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      component: Page
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.token) {
      return next({ name: "Login" });
    }
    
    if (to.matched.some(record => record.meta.isInstallerRoute)) {
      if (authStore.roles && authStore.roles.includes("installer")) {
        return next();
      } else {
        alert("Access Denied: Your profile accounts lacks approved Technician authorization privileges.");
        return next({ name: "UserDashboard" });
      }
    }

    if (to.matched.some(record => record.meta.isAdminRoute)) {
      if ((authStore.roles && authStore.roles.includes("admin")) || authStore.isAdmin) {
        return next();
      } else {
        alert("Access Denied: Administrative authority clearance required.");
        return next({ name: "UserDashboard" });
      }
    }

    next();
  } else {
    next();
  }
});

export default router
