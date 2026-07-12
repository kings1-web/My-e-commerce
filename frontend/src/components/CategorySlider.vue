<template>
  <section class="slider-container">
    <!-- Navigation Buttons -->
    <button ref="prevBtn" class="nav-btn left">‹</button>
    <button ref="nextBtn" class="nav-btn right">›</button>

    <swiper
      :modules="[EffectCoverflow, Navigation, Autoplay]"
      effect="coverflow"
      grabCursor
      centeredSlides
      :slidesPerView="'auto'"
      :coverflowEffect="coverflowEffect"
      :navigation="navigationOptions"
      :autoplay="autoplayOptions"
      :loop="(categories || []).length > 3"
      :breakpoints="breakpoints"
      class="swiper-container"
    >
      <swiper-slide
        v-for="category in categories || []"
        :key="category._id"
        class="slide"
      >
        <CategoryBox :category="category" />
      </swiper-slide>
    </swiper>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import CategoryBox from "./CategoryBox/CategoryBox.vue";

// Swiper
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, EffectCoverflow, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

defineProps({
  categories: Array,
});

// Navigation refs
const prevBtn = ref(null);
const nextBtn = ref(null);

// Navigation config (reactive)
const navigationOptions = ref({
  prevEl: null,
  nextEl: null,
});

// Autoplay
const autoplayOptions = {
  delay: 3000,
  disableOnInteraction: false,
};

// Coverflow effect
const coverflowEffect = {
  rotate: 40,
  stretch: 0,
  depth: 120,
  modifier: 1,
  slideShadows: false,
};

// Responsive
const breakpoints = {
  320: {
    slidesPerView: 1.2,
  },
  640: {
    slidesPerView: 2,
  },
  1024: {
    slidesPerView: 3,
  },
};

// Attach navigation AFTER mount
onMounted(async () => {
  await nextTick();
  navigationOptions.value.prevEl = prevBtn.value;
  navigationOptions.value.nextEl = nextBtn.value;
});
</script>

<style scoped>
.slider-container {
  position: relative;
  width: 100%;
  min-height: 350px;
  display: flex;
  align-items: center;
}

.swiper-container {
  width: 100%;
  height: 100%;
}

/* Slides */
.slide {
  max-width: 280px;
  display: flex;
  justify-content: center;
}

/* Navigation buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: #0d6efd;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
}

.left {
  left: 10px;
}

.right {
  right: 10px;
}
</style>
