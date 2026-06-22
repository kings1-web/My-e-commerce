<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <RouterLink
        class="navbar-brand"
        style="color: orangered"
        :to="{ name: 'home' }"
      >
        ROYAL-GOODS
      </RouterLink>
      
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <form class="d-flex my-2 my-lg-0 align-items-center gap-2" role="search" @submit.prevent="handleSearch">
        <div class="position-relative w-100">
          <input
            class="form-control ps-5"
            size="150"
            type="search"
            id="search-input"
            placeholder="Search products, category and brands"
            aria-label="Search"
          />
          <button
            type="submit"
            class="btn position-absolute top-50 start-0 translate-middle-y ms-2 p-0 border-0 bg-transparent"
          >
            <i class="bi bi-search" style="color: gray"></i>
          </button>
        </div>
        <RouterLink to="/installers" class="btn btn-outline-light btn-sm fw-semibold flex-shrink-0 px-3">
          Installers &rarr;
        </RouterLink>
      </form>

      <!-- Cart Icon Container -->
      <div id="cart" class="me-2" style="position: relative; color: white; padding-left: 10px">
        <span id="nav-cart-count">{{ cartCount }}</span>
        <RouterLink class="text-light" :to="{ name: 'Cart' }">
          <i class="bi bi-cart4" style="font-size: 20px"></i>
        </RouterLink>
      </div>

      <!-- 🟢 UPWORK ROLE SWITCHER DROPDOWN (Renders right next to the Cart item) -->
      <div class="nav-item dropdown d-inline-block ms-2" v-if="isLoggedIn && authStore.roles && authStore.roles.length > 1">
        <button 
          class="btn btn-primary btn-sm dropdown-toggle fw-bold shadow-xs px-3 py-2 rounded-pill d-flex align-items-center gap-1" 
          type="button" 
          id="roleSwitcherDropdown" 
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          🔄 Workspace: <span class="text-white fw-semibold">{{ activeRoleTitle }}</span>
        </button>
        
        <ul class="dropdown-menu dropdown-menu-end shadow border-0 p-2 mt-2 rounded-3" aria-labelledby="roleSwitcherDropdown" style="z-index: 1050;">
          <li class="dropdown-header small text-muted font-monospace pb-2 border-bottom">Switch View Profile</li>
          
          <li class="mt-1">
            <button 
              class="dropdown-item py-2 rounded d-flex align-items-center gap-2 small" 
              :class="{ 'active bg-primary text-white': activeRoleTitle === 'Client' }"
              @click="switchToPortal('customer', '/dashboard')"
            >
              🛒 Buyer / Client Dashboard
            </button>
          </li>
          
          <li v-if="authStore.roles.includes('installer')">
            <button 
              class="dropdown-item py-2 rounded d-flex align-items-center gap-2 small" 
              :class="{ 'active bg-success text-white': activeRoleTitle === 'Installer' }"
              @click="switchToPortal('installer', '/installer-dashboard')"
            >
              👨‍🔧 Technician / Installer Dashboard
            </button>
          </li>
          
          <li v-if="authStore.roles.includes('admin') || isAdmin">
            <button 
              class="dropdown-item py-2 rounded d-flex align-items-center gap-2 small" 
              :class="{ 'active bg-danger text-white': activeRoleTitle === 'Admin' }"
              @click="switchToPortal('admin', '/admin-panel')"
            >
              🛡️ Admin Control Panel
            </button>
          </li>
        </ul>
      </div>

      <!-- Main Navigation Menu Dropdown List Blocks -->
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle text-light"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Browse
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'home' }">
                  Home
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'UserOrders' }">
                  Orders
                </RouterLink>
              </li>
              
              <!-- 🟢 CONDITIONAL DROPDOWN SHORTCUTS: Only show what the user has access to -->
              <li v-if="isLoggedIn && (authStore.roles.includes('admin') || isAdmin)">
                <RouterLink class="dropdown-item fw-semibold text-danger" :to="{ name: 'Admin' }">
                  🛡️ Admin Panel
                </RouterLink>
              </li>
              <li v-if="isLoggedIn && authStore.roles.includes('installer')">
                <RouterLink class="dropdown-item fw-semibold text-success" :to="{ name: 'InstallerDashboard' }">
                  👨‍🔧 Installer Dashboard
                </RouterLink>
              </li>
              <li v-if="isLoggedIn">
                <RouterLink :to="{ name: 'UserDashboard' }" class="dropdown-item fw-semibold text-primary">
                  💻 Job Dashboard
                </RouterLink>
              </li>
            </ul>
          </li>
          
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle text-light"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Account
            </a>
            <ul class="dropdown-menu">
              <li v-if="!isLoggedIn">
                <RouterLink class="dropdown-item" :to="{ name: 'SignUp' }">
                  SignUp
                </RouterLink>
              </li>
              <li v-if="!isLoggedIn">
                <RouterLink class="dropdown-item" :to="{ name: 'Login' }">
                  Sign In
                </RouterLink>
              </li>
              <li v-if="isLoggedIn">
                <a class="dropdown-item fw-bold text-danger" href="#" @click.prevent="logout">
                  Sign Out
                </a>
              </li>
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
  name: "NavbarWidget",
  data() {
    return {
      authStore: useAuthStore(), 
      activeRoleTitle: "Client"
    };
  },
  mounted() {
    this.$emit("fetchData");
    this.$emit("updateCart");
    this.evaluateCurrentUIRoutePath();
  },
  watch: {
    // 🟢 Keep the view header role title synchronized automatically on route changes
    '$route'() { 
      this.evaluateCurrentUIRoutePath(); 
    }
  },
  methods: {
    handleSearch() {
      const input = document.getElementById("search-input").value;
      this.$router.push({ name: "Search", query: { q: input } });
    },
    evaluateCurrentUIRoutePath() {
      if (this.$route.path.includes('installer-dashboard')) {
        this.activeRoleTitle = "Installer";
      } else if (this.$route.path.includes('admin-panel') || this.$route.path.includes('Admin')) {
        this.activeRoleTitle = "Admin";
      } else {
        this.activeRoleTitle = "Client";
      }
    },
    switchToPortal(role, targetPath) {
      if (this.$swal) {
        this.$swal({
          text: `Switching workspace layout view to your ${role} portal...`,
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 1500,
          showConfirmButton: false
        });
      }
      this.$router.push(targetPath);
    },
    logout() {
      // 🟢 Complete security cleanup across all Pinia and LocalStorage containers
      this.authStore.logout(); 

      const cartStore = useCartStore();
      cartStore.resetCart();

      this.$swal({
        text: "Logged out successfully, visit again",
        icon: "success",
      });

      this.$router.push({ name: "home" });
      this.$emit("fetchData");
    },
  },
  computed: {
    ...mapState(useCartStore, ["cartCount"]),
    ...mapState(useAuthStore, ["token", "isLoggedIn", "isAdmin"]),
  },
};
</script>

<style scoped>
#nav-cart-count {
  background-color: red;
  color: white;
  border-radius: 50%;
  height: 15px;
  width: 15px;
  font-size: 11px;
  align-items: center;
  display: flex;
  justify-content: center;
  position: absolute;
  margin-left: 10px;
  top: -8px;
  z-index: 5;
}
.shadow-xs {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
