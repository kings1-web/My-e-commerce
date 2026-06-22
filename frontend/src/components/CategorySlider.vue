<template>
  
  <section class="w-11/1 mx-auto mt-10 relative slider-container">
    <!-- NAV BUTTONS -->

    <!-- Left Button (Previous) -->
<button
  ref="prevBtn"
  class="position-absolute top-50 start-0 translate-middle-y ms-3 z-3 text-white bg-primary p-2 rounded-circle"
  style="top: 66%;"
>
  <i class="bi bi-arrow-left fs-3"></i>
</button>

<!-- Right Button (Next) -->
<button
  ref="nextBtn"
  class="position-absolute top-50 end-0 translate-middle-y me-3 z-3 text-white bg-primary p-2 rounded-circle"
  style="top: 66%;"
>
  <i class="bi bi-arrow-right fs-3"></i>
</button>


    <button ref="prevBtn" class="nav-btn left">‹</button>
    <button ref="nextBtn" class="nav-btn right">›</button>

    <swiper
      :effect="'coverflow'"
      grabCursor
      centeredSlides
      :slidesPerView="'auto'"
      :coverflowEffect="{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      }"
      :navigation="navigationOptions"
      loop
      :modules="[EffectCoverflow, Navigation]"
      class="w-full"
    >
      <swiper-slide
        v-for="category in categories"
        :key="category.id"
        class="slide"
      >
        <CategoryBox
          :category="category"
          @category-deleted="$emit('refresh')"
        />
      </swiper-slide>
    </swiper>
  </section>
  
</template>

<script setup>
import { ref, onMounted } from "vue";
import CategoryBox from "./CategoryBox/CategoryBox.vue";

// Swiper
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

const props = defineProps({
  categories: Array,
});

// navigation (KEEP THIS)
const prevBtn = ref(null);
const nextBtn = ref(null);

const navigationOptions = {
  prevEl: null,
  nextEl: null,
};

onMounted(() => {
  navigationOptions.prevEl = prevBtn.value;
  navigationOptions.nextEl = nextBtn.value;
});

// 🔥 COVERFLOW CONFIG
const coverflowEffect = {};
</script>

<style scoped>
.nav-btn {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  z-index: 10;
  background: #000;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
}

.slider-container {
  height: 350px; /* 🔥 adjust based on your card height */
  display: flex;
  align-items: center;
  margin-top:10px;
}

.swiper {
  height: 100%;
}

.left {
  left: 0;
}

.right {
  right: 0;
}

/* 🔥 THIS CONTROLS HOW MANY YOU SEE */
.slide {
  max-width: 280px;
  display: flex;
  justify-content: center;
}
</style>
