<template>
  <footer class="footer">
    <div class="container pt-5">
      <div class="row gy-4">

        <!-- Brand -->
        <div class="col-md-3 col-12">
          <h4 class="logo">Kingsley Store</h4>
          <p class="footer-text">
            Your one-stop shop for quality gadgets and accessories.
          </p>

          <!-- Social Icons -->
          <div class="socials">
            <i class="bi bi-facebook"></i>
            <i class="bi bi-instagram"></i>
            <i class="bi bi-twitter-x"></i>
            <i class="bi bi-whatsapp"></i>
          </div>
        </div>

        <!-- Column 1 -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Get To Know Us</h6>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <!-- Column 2 -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Connect With Us</h6>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">WhatsApp</a></li>
          </ul>
        </div>

        <!-- Column 3 -->
        <div class="col-md-3 col-6">
          <h6 class="footer-title">Make Money</h6>
          <ul>
            <li><a href="#">Sell on Store</a></li>
            <li><a href="#">Affiliate</a></li>
            <li><a href="#">Advertise</a></li>
          </ul>
        </div>

      </div>
    </div>


    <!-- Bottom Bar -->
    <div class="footer-bottom text-center mt-4">
      <p>© 2026 Kingsley Store. All rights reserved.</p>
    </div>
  </footer>
</template>


<style scoped>
.footer {
  margin-top: 100px;
  background: linear-gradient(135deg, #232F3E, #0f172a);
  color: #ccc;
  font-size: 14px;
}

/* Brand */
.logo {
  color: #fff;
  font-weight: bold;
}

.footer-text {
  margin: 10px 0;
  line-height: 1.6;
}

/* Titles */
.footer-title {
  color: #fff;
  margin-bottom: 15px;
  font-weight: 600;
}

/* Links */
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

/* Social Icons */
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

/* Bottom */
.footer-bottom {
  background: #0f172a;
  padding: 15px 0;
  font-size: 13px;
  color: #aaa;
}
</style>