<template>
  <div class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h3>our category</h3>
        <RouterLink :to="{name:'AddCategory'}">
          <button style="float:right">
            Add Category
          </button>
        </RouterLink>
      </div>
    </div>
    <div class="row">
      <div v-for="category of categories" :key="category.id"
      class="col-md-6 col-xl-4 col-12 pt-3 d-flex"><br/><br/>
       <CategoryBox :category="category"/>
       <br/>
      </div>
    </div>
  </div>
</template>

<script>
import CategoryBox from "@/components/CategoryBox/CategoryBox.vue";

export default {
    name:'Category',
    props:["categories"],
    components:{CategoryBox},
  data() {
    return {
      //baseURL: "https://kings1-web-e-commerce.onrender.com/api/v1/" ,
     // baseURL: "http://localhost:3000/api/v1/",

    };
  },
  methods: {
   
  },
  mounted(){
  }
};
</script>
