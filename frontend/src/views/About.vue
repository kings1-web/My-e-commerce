<template>
  <div class="about-page bg-light py-5">
    <div class="container">
      
      <!-- HERO HEADER -->
      <div class="row align-items-center mb-5 pb-4 border-bottom">
        <div class="col-lg-6 mb-4 mb-lg-0 text-start">
          <span class="badge bg-warning text-dark fw-bold mb-2 px-3 py-2">
            About ShoppersFix
          </span>
          <h1 class="display-5 fw-bold text-dark mb-3">
            Your Trusted Hub for Hardware & Handyman Services
          </h1>
          <p class="lead text-secondary">
            ShoppersFix is a hybrid e-commerce and service marketplace dedicated to providing genuine plumbing accessories, electrical fittings, phone accessories, and reliable technician bookings across Nigeria.
          </p>
          <div class="d-flex gap-3 mt-4">
            <RouterLink to="/" class="btn btn-warning fw-bold px-4 py-2">
              🛍️ Shop Products
            </RouterLink>
            <RouterLink to="/installers" class="btn btn-outline-dark fw-bold px-4 py-2">
              🛠️ Book a Handyman
            </RouterLink>
          </div>
        </div>
        <div class="col-lg-6 text-center">
          <div class="about-hero-img-wrapper p-3 bg-white shadow-sm rounded-4 border">
            <img 
              src="@/assets/logo.png" 
              alt="ShoppersFix Banner" 
              class="img-fluid rounded-3 max-hero-img"
              @error="handleImgError"
            />
          </div>
        </div>
      </div>

      <!-- OUR STORY & MISSION -->
      <div class="row g-4 mb-5">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4">
            <div class="card-body">
              <div class="icon-box bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px;">
                <i class="bi bi-bullseye fs-3 text-dark"></i>
              </div>
              <h3 class="fw-bold mb-3">Our Mission</h3>
              <p class="text-muted">
                To eliminate the frustration of buying counterfeit installation hardware and unverified labor. We bridge the gap by delivering 100% authentic products straight to your doorstep while connecting you with vetted, skilled handymen for seamless installation and repair.
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4">
            <div class="card-body">
              <div class="icon-box bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 50px; height: 50px;">
                <i class="bi bi-eye fs-3 text-primary"></i>
              </div>
              <h3 class="fw-bold mb-3">Our Vision</h3>
              <p class="text-muted">
                To become West Africa’s most reliable one-stop platform for building maintenance, home repairs, and high-quality electrical, plumbing, and tech accessories.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- WHY CHOOSE US -->
      <div class="my-5 py-4">
        <div class="text-center mb-5">
          <h2 class="fw-bold">Why Choose ShoppersFix?</h2>
          <p class="text-muted">Built for convenience, reliability, and speed.</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4" v-for="(feature, index) in features" :key="index">
            <div class="card border-0 shadow-sm h-100 text-center p-4 rounded-4 hover-card">
              <div class="card-body">
                <div class="feature-icon mb-3 text-warning fs-1">
                  <i :class="feature.icon"></i>
                </div>
                <h5 class="fw-bold mb-2">{{ feature.title }}</h5>
                <p class="text-muted small m-0">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STATS / TRUST BANNER -->
      <div class="bg-dark text-white rounded-4 p-4 p-md-5 my-5 text-center shadow">
        <div class="row g-4">
          <div class="col-6 col-md-3">
            <h2 class="display-6 fw-bold text-warning mb-1">100%</h2>
            <p class="small text-light-50 m-0">Genuine Products</p>
          </div>
          <div class="col-6 col-md-3">
            <h2 class="display-6 fw-bold text-warning mb-1">Verified</h2>
            <p class="small text-light-50 m-0">Expert Installers</p>
          </div>
          <div class="col-6 col-md-3">
            <h2 class="display-6 fw-bold text-warning mb-1">Fast</h2>
            <p class="small text-light-50 m-0">Nationwide Delivery</p>
          </div>
          <div class="col-6 col-md-3">
            <h2 class="display-6 fw-bold text-warning mb-1">24/7</h2>
            <p class="small text-light-50 m-0">Customer Support</p>
          </div>
        </div>
      </div>

      <!-- CALL TO ACTION -->
      <div class="text-center py-4">
        <h3 class="fw-bold mb-3">Have Questions or Need Direct Support?</h3>
        <p class="text-muted mb-4">Reach out to our team directly via WhatsApp or phone call.</p>
        <div class="d-flex justify-content-center gap-3">
          <a href="https://wa.link/3pxzcs" target="_blank" class="btn btn-success fw-bold px-4 py-2">
            <i class="bi bi-whatsapp me-1"></i> Chat on WhatsApp
          </a>
          <RouterLink to="/" class="btn btn-outline-dark fw-bold px-4 py-2">
            Explore Marketplace
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return {
      features: [
        {
          icon: "bi bi-shield-check",
          title: "Guaranteed Quality",
          description: "All plumbing, electrical fittings, and accessories are sourced directly from trusted manufacturers.",
        },
        {
          icon: "bi bi-tools",
          title: "Vetted Handymen",
          description: "Book experienced, background-checked technicians for your home or office installation needs.",
        },
        {
          icon: "bi bi-truck",
          title: "Nationwide Delivery",
          description: "Fast shipping across Lagos and all states in Nigeria with pay-on-delivery options available.",
        },
      ],
    };
  },
  methods: {
    handleImgError(e) {
      e.target.src = "https://via.placeholder.com/500x300?text=ShoppersFix";
    },
  },
};
</script>

<style scoped>
.about-page {
  min-height: 80vh;
}

.max-hero-img {
  max-height: 280px;
  object-fit: contain;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>