<template>
  <footer class="footer">
    <div class="container pt-5">
      <div class="row gy-4">
        <!-- Brand / Profile Column -->
        <div class="col-md-3 col-12">
          <h4 class="logo">Kingsley Store</h4>
          <p class="footer-text">
            Your one-stop shop for quality gadgets and accessories.
          </p>

          <!-- Social Media Profiles Icons -->
          <div class="socials">
            <i class="bi bi-facebook"></i>
            <i class="bi bi-instagram"></i>
            <i class="bi bi-twitter-x"></i>
            <i class="bi bi-whatsapp"></i>
          </div>
        </div>

        <!-- Column 1: Informational Links -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Get To Know Us</h6>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <!-- Column 2: External Profiles links -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Connect With Us</h6>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">WhatsApp</a></li>
          </ul>
        </div>

        <!-- Column 3: Platform Monetization links -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Make Money</h6>
          <ul>
            <li><a href="#">Sell on Store</a></li>
            <li><a href="#">Affiliate</a></li>
            <li><a href="#">Advertise</a></li>

            <!-- 🟢 FIXED & ENCLOSED: Moved inside the ul container tag block cleanly -->
            <!-- 🟢 ACTION v-if GUARD: Keeps option visible to guests and shoppers, but hides it if they are already an approved installer -->
            <li
              v-if="
                !authStore.token ||
                (authStore.roles && !authStore.roles.includes('installer'))
              "
            >
              <!-- 🟢 FIXED: Changed name object lookups to a clean, direct path url string -->
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
    </div>

    <!-- Bottom Copyright Disclaimer Bar -->
    <div class="footer-bottom text-center mt-4">
      <p class="mb-0">© 2026 Kingsley Store. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
import { useAuthStore } from "@/stores/auth";

export default {
  name: "PlatformMainFooterWidget",
  data() {
    return {
      // 🟢 Connect store state metrics so your template can run role v-if check filters
      authStore: useAuthStore(),
    };
  },
};
</script>

<style scoped>
.footer {
  margin-top: 100px;
  background: linear-gradient(135deg, #232f3e, #0f172a);
  color: #ccc;
  font-size: 14px;
}

/* Brand styling properties */
.logo {
  color: #fff;
  font-weight: bold;
}

.footer-text {
  margin: 10px 0;
  line-height: 1.6;
}

/* Titles section indicators */
.footer-title {
  color: #fff;
  margin-bottom: 15px;
  font-weight: 600;
}

/* Links collection management */
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

/* 🟢 Style override ensures link mimics your look cleanly */
.text-warning-link {
  color: #ff7a00 !important;
  transition: 0.3s;
}
.text-warning-link:hover {
  padding-left: 5px;
  opacity: 0.9;
}

/* Social media layout icons attributes */
.socials i {
  font-size: 20px;
  margin-right: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.socials i:hover {
  color: #ff7a00;
  transform: scale(1.2);
}

/* Bottom Bar settings profiles */
.footer-bottom {
  background: #0f172a;
  padding: 15px 0;
  font-size: 13px;
  color: #aaa;
}
</style>
