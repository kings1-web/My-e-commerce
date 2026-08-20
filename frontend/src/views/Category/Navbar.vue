<template>
  <header class="bg-dark text-white sticky-top shadow-sm">
    <!-- 🟢 TOP ANNOUNCEMENT & TRUST BAR -->
   <div class="bg-warning text-dark py-1 px-3 small border-bottom border-primary-subtle">
  <div class="container-fluid d-flex justify-content-between align-items-center fs-7">
    <div class="d-flex align-items-center gap-3">
      <span class="d-none d-md-inline"><i class="bi bi-truck me-1"></i> Fast Ondo & Nationwide Delivery</span>
      <span class="d-none d-md-inline"><i class="bi bi-shield-check me-1"></i> Quality Guaranteed</span>
      <span><i class="bi bi-cash-stack me-1"></i> Pay on Delivery Available</span>
    </div>
    <div class="d-none d-md-flex align-items-center gap-3">
      <a href="https://wa.me/2349018629904" target="_blank" class="text-dark text-decoration-none fw-semibold">
        <i class="bi bi-whatsapp me-1 text-success"></i> Order via WhatsApp
      </a>
      <span class="text-dark-50">|</span>
      <a href="tel:+2348148674341" class="text-dark text-decoration-none">
        <i class="bi bi-telephone-fill me-1"></i> Call Us
      </a>
    </div>
  </div>
</div>

    <!-- 🟢 1. MAIN NAVIGATION & SEARCH BAR -->
    <div class="container-fluid px-3 py-2 border-bottom border-secondary">
      <div class="d-flex align-items-center justify-content-between gap-2">
        
        <!-- Brand Logo -->
        <RouterLink class="navbar-brand d-flex align-items-center me-1 py-0" :to="{ name: 'home' }">
          <img src="@/assets/logo.png" alt="SHOPPERSFIX Logo" class="navbar-logo bg-white" />
        </RouterLink>

        <!-- Search Bar Form -->
        <form class="flex-grow-1 mx-2" style="max-width: 480px;" role="search" @submit.prevent="handleSearch">
          <div class="position-relative">
            <input
              class="form-control form-control-sm ps-4 pe-5 rounded-pill bg-light text-dark"
              type="search"
              v-model="searchQuery"
              placeholder="Search plumbing, electrical, phone accessories..."
              aria-label="Search"
            />
            <button type="submit" class="btn position-absolute top-50 start-0 translate-middle-y ms-1 p-0 border-0 bg-transparent">
              <i class="bi bi-search text-muted small"></i>
            </button>
          </div>
        </form>

        <!-- Action Controls -->
        <div class="d-flex align-items-center gap-2">
          
          <!-- Hire Technician Quick Button -->
          <RouterLink to="/installers" class="btn btn-warning btn-sm fw-bold text-nowrap d-none d-lg-inline-block shadow-xs">
            🛠️ Hire a Pro
          </RouterLink>

          <!-- Cart Icon Badge -->
          <div id="cart" class="position-relative mx-1">
            <span id="nav-cart-count">{{ cartCount }}</span>
            <RouterLink class="text-light fs-5" :to="{ name: 'Cart' }">
              <i class="bi bi-cart4"></i>
            </RouterLink>
          </div>

          <!-- Role Switcher Dropdown (Desktop) -->
          <div
            class="nav-item dropdown d-none d-md-inline-block ms-1"
            v-if="isLoggedIn && authStore.roles && authStore.roles.length > 1"
          >
            <button
              class="btn btn-outline-light btn-sm dropdown-toggle fw-bold shadow-xs px-2 py-1 rounded-pill d-flex align-items-center gap-1"
              type="button"
              id="roleSwitcherDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              🔄 <span class="d-none d-lg-inline">Workspace:</span>
              <span class="text-white fw-semibold">{{ activeRoleTitle }}</span>
            </button>

            <ul
              class="dropdown-menu dropdown-menu-end shadow border-0 p-2 mt-2 rounded-3"
              aria-labelledby="roleSwitcherDropdown"
              style="z-index: 1050"
            >
              <li class="dropdown-header small text-muted font-monospace pb-2 border-bottom">
                Switch View Profile
              </li>
              <li class="mt-1">
                <button
                  class="dropdown-item py-2 rounded d-flex align-items-center gap-2 small"
                  :class="{ 'active bg-primary text-white': activeRoleTitle === 'Client' }"
                  @click="switchToPortal('customer', 'UserDashboard')"
                >
                  🛒 Buyer / Client
                </button>
              </li>
              <li v-if="authStore.roles.includes('installer')">
                <button
                  class="dropdown-item py-2 rounded d-flex align-items-center gap-2 small"
                  :class="{ 'active bg-success text-white': activeRoleTitle === 'Installer' }"
                  @click="switchToPortal('installer', 'InstallerDashboard')"
                >
                  👨‍🔧 Technician
                </button>
              </li>
              <li v-if="authStore.roles.includes('admin') || isAdmin">
                <button
                  class="dropdown-item py-2 rounded d-flex align-items-center gap-2 small"
                  :class="{ 'active bg-danger text-white': activeRoleTitle === 'Admin' }"
                  @click="switchToPortal('admin', 'Admin')"
                >
                  🛡️ Admin Panel
                </button>
              </li>
            </ul>
          </div>

          <!-- Hamburger Toggle Button -->
          <button
            class="btn btn-dark p-1 ms-1 text-light border-0"
            type="button"
            @click="isMenuOpen = !isMenuOpen"
            aria-label="Toggle navigation"
          >
            <i class="bi" :class="isMenuOpen ? 'bi-x-lg' : 'bi-list'" style="font-size: 1.5rem;"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 🟢 QUICK CATEGORY BAR (Drives Fast Browsing) -->
    <div class="bg-dark border-bottom border-secondary-subtle py-1 px-3 d-none d-md-block">
      <div class="container-fluid d-flex align-items-center justify-content-start gap-4 small fw-semibold">
        <RouterLink to="/" class="text-light text-decoration-none hover-warning">
          🛍️ Shoppers Home
        </RouterLink>
        <a href="#feature-product" class="text-white-50 text-decoration-none hover-warning">
          ⚡ Electrical Fittings
        </a>
        <a href="#feature-product" class="text-white-50 text-decoration-none hover-warning">
          🚰 Plumbing Accessories
        </a>
        <a href="#feature-product" class="text-white-50 text-decoration-none hover-warning">
          📱 Phone Accessories
        </a>
        <RouterLink to="/installers" class="text-warning text-decoration-none ms-auto">
          🔧 Book Handyman Services &rarr;
        </RouterLink>
      </div>
    </div>

    <!-- 🟢 2. SECONDARY COLLAPSIBLE DRAWER -->
    <div v-if="isMenuOpen" class="bg-dark border-bottom border-secondary py-3 px-3 animate-slide-down">
      <div class="container-fluid d-flex flex-column gap-3">
        
        <ul class="nav flex-column flex-md-row gap-3 w-100">
          
          <!-- Browse Dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle text-light p-0 fw-semibold" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Browse Categories
            </a>
            <ul class="dropdown-menu shadow">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'home' }" @click="closeMenu">
                  Shoppers Home
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'UserOrders' }" @click="closeMenu">
                  My Orders
                </RouterLink>
              </li>
              <li v-if="isLoggedIn && authStore.roles && (authStore.roles.includes('admin') || isAdmin)">
                <RouterLink class="dropdown-item fw-semibold text-danger" :to="{ name: 'Admin' }" @click="closeMenu">
                  🛡️ Admin Panel
                </RouterLink>
              </li>
              <li v-if="isLoggedIn && authStore.roles && authStore.roles.includes('installer')">
                <RouterLink class="dropdown-item fw-semibold text-success" :to="{ name: 'InstallerDashboard' }" @click="closeMenu">
                  👨‍🔧 Installer Dashboard
                </RouterLink>
              </li>
              <li v-if="isLoggedIn">
                <RouterLink :to="{ name: 'UserDashboard' }" class="dropdown-item fw-semibold text-primary" @click="closeMenu">
                  💻 Job Dashboard
                </RouterLink>
              </li>
              <li v-if="isLoggedIn && authStore.roles && !authStore.roles.includes('installer')">
                <RouterLink class="dropdown-item fw-semibold text-primary" :to="{ name: 'BecomeInstaller' }" @click="closeMenu">
                  🛠️ Apply as a Technician
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Account Dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle text-light p-0 fw-semibold" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Account
            </a>
            <ul class="dropdown-menu shadow">
              <li v-if="!isLoggedIn">
                <RouterLink class="dropdown-item" :to="{ name: 'SignUp' }" @click="closeMenu">
                  Sign Up
                </RouterLink>
              </li>
              <li v-if="!isLoggedIn">
                <RouterLink class="dropdown-item" :to="{ name: 'Login' }" @click="closeMenu">
                  Sign In
                </RouterLink>
              </li>
              <li v-if="!authStore.token || (authStore.roles && !authStore.roles.includes('installer'))">
                <RouterLink class="fw-semibold text-warning-link text-decoration-none dropdown-item" :to="{ name: 'BecomeInstaller' }" @click="closeMenu">
                  🛠️ Apply as a Technician
                </RouterLink>
              </li>
              <li v-if="isLoggedIn">
                <a class="dropdown-item fw-bold text-danger" href="#" @click.prevent="logout">
                  Sign Out
                </a>
              </li>
            </ul>
          </li>

          <!-- Mobile Only Links -->
          <li class="nav-item d-sm-none pt-1">
            <RouterLink to="/installers" class="nav-link text-warning p-0 fw-semibold" @click="closeMenu">
              🛠️ Hire a Technician &rarr;
            </RouterLink>
          </li>
          <li class="nav-item d-sm-none pt-1">
            <a href="https://wa.me/2348000000000" target="_blank" class="nav-link text-success p-0 fw-semibold">
              💬 Direct WhatsApp Order
            </a>
          </li>
        </ul>

        <!-- Mobile Only Role Switcher -->
        <div class="d-md-none border-top border-secondary pt-2" v-if="isLoggedIn && authStore.roles && authStore.roles.length > 1">
          <label class="small text-muted mb-1 font-monospace">Switch Workspace Profile:</label>
          <div class="d-flex gap-2 flex-wrap">
            <button
              class="btn btn-sm"
              :class="activeRoleTitle === 'Client' ? 'btn-primary' : 'btn-outline-light'"
              @click="switchToPortal('customer', 'UserDashboard')"
            >
              🛒 Buyer
            </button>
            <button
              v-if="authStore.roles.includes('installer')"
              class="btn btn-sm"
              :class="activeRoleTitle === 'Installer' ? 'btn-success' : 'btn-outline-light'"
              @click="switchToPortal('installer', 'InstallerDashboard')"
            >
              👨‍🔧 Technician
            </button>
            <button
              v-if="authStore.roles.includes('admin') || isAdmin"
              class="btn btn-sm"
              :class="activeRoleTitle === 'Admin' ? 'btn-danger' : 'btn-outline-light'"
              @click="switchToPortal('admin', 'Admin')"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/CartStore";
import { mapState } from "pinia";

export default {
  name: "NavbarWidget",
  data() {
    return {
      searchQuery: "",
      activeRoleTitle: "Client",
      isMenuOpen: false,
    };
  },
  computed: {
    ...mapState(useCartStore, ["cartCount"]),
    ...mapState(useAuthStore, ["token", "isLoggedIn", "isAdmin"]),
    authStore() {
      return useAuthStore();
    },
  },
  mounted() {
    this.$emit("fetchData");
    this.$emit("updateCart");
    this.evaluateCurrentUIRoutePath();
  },
  watch: {
    $route() {
      this.closeMenu();
      this.evaluateCurrentUIRoutePath();
    },
  },
  methods: {
    closeMenu() {
      this.isMenuOpen = false;
    },
    handleSearch() {
      if (!this.searchQuery.trim()) return;
      this.closeMenu();
      this.$router.push({
        name: "Search",
        query: { q: this.searchQuery.trim() },
      });
    },
    evaluateCurrentUIRoutePath() {
      const path = this.$route.path.toLowerCase();
      if (path.includes("installer")) {
        this.activeRoleTitle = "Installer";
      } else if (path.includes("admin")) {
        this.activeRoleTitle = "Admin";
      } else {
        this.activeRoleTitle = "Client";
      }
    },
    switchToPortal(roleMode, targetRouteName) {
      this.closeMenu();
      if (typeof this.authStore.setActiveViewMode === "function") {
        this.authStore.setActiveViewMode(roleMode);
      }

      if (this.$swal) {
        this.$swal({
          text: `Switching workspace layout view to your ${roleMode} portal...`,
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      this.$router.push({ name: targetRouteName });
    },
    logout() {
      this.closeMenu();
      this.authStore.logout();
      const cartStore = useCartStore();
      cartStore.resetCart();

      if (this.$swal) {
        this.$swal({
          text: "Logged out successfully, visit again",
          icon: "success",
        });
      }

      this.$router.push({ name: "home" });
      this.$emit("fetchData");
    },
  },
};
</script>

<style scoped>
.navbar-logo {
  height: 28px;
  width: auto;
  object-fit: contain;
  border-radius: 40%;
}

#nav-cart-count {
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -6px;
  right: -8px;
  z-index: 5;
}

.fs-7 {
  font-size: 0.8rem;
}

.hover-warning:hover {
  color: #ffc107 !important;
}

.shadow-xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.animate-slide-down {
  animation: slideDown 0.2s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>