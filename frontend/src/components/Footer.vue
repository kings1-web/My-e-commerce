<template>
  <footer class="footer">
    <div class="container pt-5 pb-4">
      <div class="row gy-4">
        <!-- Brand / Profile Column -->
        <div class="col-md-3 col-12">
          <h4 class="logo">ShoppersFix</h4>
          <p class="footer-text">
            Your trusted hub for genuine plumbing, electrical fittings, phone accessories, and verified handyman services.
          </p>

          <!-- Social Media Profiles Icons -->
          <div class="socials">
            <a href="https://wa.link/3pxzcs" target="_blank" class="text-light me-3"><i class="bi bi-whatsapp"></i></a>
            <a href="#" class="text-light me-3"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-light me-3"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-light"><i class="bi bi-twitter-x"></i></a>
          </div>
        </div>

        <!-- Column 1: Get To Know Us (Connected Vue Router Links) -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Get To Know Us</h6>
          <ul>
            <li><RouterLink to="/about">About Us</RouterLink></li>
            <li><RouterLink to="/return-policy">Return & Refund Policy</RouterLink></li>
            <li><RouterLink to="/terms">Terms & Conditions</RouterLink></li>
            <li><RouterLink to="/privacy-policy">Privacy Policy</RouterLink></li>
          </ul>
        </div>

        <!-- Column 2: External Profiles links -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Customer Care</h6>
          <ul>
            <li><a href="https://wa.link/3pxzcs" target="_blank">Contact Support</a></li>
            <li><RouterLink to="/installers">Book a Technician</RouterLink></li>
            <li><a href="#shop-now">Browse Products</a></li>
          </ul>
        </div>

        <!-- Column 3: Platform Monetization links -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Make Money</h6>
          <ul>
            <li><a href="#">Sell on Store</a></li>
            <li><a href="#">Affiliate</a></li>

            <!-- ACTION v-if GUARD: Keeps option visible to guests, hides if approved technician -->
            <li
              v-if="
                !authStore.token ||
                (authStore.roles && !authStore.roles.includes('installer'))
              "
              class="mt-2"
            >
              <RouterLink
                class="fw-semibold text-warning-link text-decoration-none"
                to="/become-an-installer"
              >
                🛠️ Apply as a Technician
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Trust Badges Bar -->
      <div class="row pt-4 mt-4 border-top border-secondary text-center text-md-start align-items-center">
        <div class="col-md-6 mb-3 mb-md-0">
          <span class="badge bg-outline-light border text-light me-2 p-2">🔒 256-Bit SSL Secured</span>
          <span class="badge bg-outline-light border text-light p-2">⚡ Fast Nationwide Delivery</span>
        </div>
        <div class="col-md-6 text-md-end text-muted small">
          Accepted Payments: Card, Bank Transfer, Pay on Delivery
        </div>
      </div>
    </div>

    <!-- Bottom Copyright Disclaimer Bar -->
    <div class="footer-bottom text-center">
      <p class="mb-0">© 2026 ShoppersFix. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
import { useAuthStore } from "@/stores/auth";

export default {
  name: "PlatformMainFooterWidget",
  data() {
    return {
      authStore: useAuthStore(),
    };
  },
};
</script>

<style scoped>
.footer {
  margin-top: 80px;
  background: linear-gradient(135deg, #232f3e, #0f172a);
  color: #ccc;
  font-size: 14px;
}

.logo {
  color: #fff;
  font-weight: bold;
}

.footer-text {
  margin: 10px 0;
  line-height: 1.6;
}

.footer-title {
  color: #fff;
  margin-bottom: 15px;
  font-weight: 600;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  margin-bottom: 10px;
}

ul li a {
  color: #bbb;
  text-decoration: none;
  transition: 0.3s;
}

ul li a:hover {
  color: #ff7a00;
  padding-left: 5px;
}

.text-warning-link {
  color: #ff7a00 !important;
  transition: 0.3s;
}
.text-warning-link:hover {
  padding-left: 5px;
  opacity: 0.9;
}

.socials i {
  font-size: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.socials i:hover {
  color: #ff7a00;
  transform: scale(1.2);
}

.footer-bottom {
  background: #0f172a;
  padding: 15px 0;
  font-size: 13px;
  color: #aaa;
}
</style>
