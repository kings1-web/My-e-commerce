<template>
  <div class="card product-card h-100  img-fluid">
    <div class="embed-responsive embed-responsive-10px">
      <RouterLink :to="{ name: 'ListProduct', params: { id: category.id } }">
      <img
        :src="category.image"
        class="card-img-top"
        alt="category images"
      />
    </RouterLink>
    </div>
    <div class="card-body">
      <RouterLink :to="{ name: 'ListProduct', params: { id: category.id } }">
        <h6 class="card-title text-capitalize">{{ category.name.substring(0, 25) }}</h6>
      </RouterLink>
      <h6 class="card-text text-capitalize">{{ category.icon.substring(0, 25) }}</h6>
      <div class="d-flex justify-content-between mt-3">
      <RouterLink
        :to="{ name: 'EditCategory', params: { id: category.id } }"
        v-show="$route.name == 'Category'"
      >
        <button class="btn btn-primary">Edit</button>
      </RouterLink>
      <button class="btn btn-danger ml-2" @click="deleteCategory()" v-show="$route.name == 'Category'">
            DELETE
          </button>
          </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: "CategoryBox",
  data(){
    return{
       baseURL:"https://royalgoods.onrender.com/api/v1/",
     //baseURL: "http://localhost:3000/api/v1/",
    }
  },
  props: ["category"],
  methods: {
    async deleteCategory(){
  if(!confirm('are you sure you want to delete this category?'))return;

  try{
    await axios.delete(`${this.baseURL}categories/${this.category.id}`,{
      headers:{Authorization:`Bearer ${localStorage.getItem("token")}`

      }
    });
    this.$emit("category-deleted",this.category.id);
    this.$swal({
             text:"category deleted successfully",
             icon:"success"
              });
  }catch(err){
    console.error('Error deleting category:', err)
    this.$swal({
             text:"Failed to delete category!",
             icon:"error"
              });
  }
}
  },
};
</script>

<style scope>
.product-card {
  border: 1px solid #ddd;
  transition: transform 0.2s ease;
}
.product-card:hover {
  transform: scale(1.02);
}
.card-img-top {
  object-fit: cover;
  max-width: 100%;
  max-height: 300px;
}
.card-body {
  margin-bottom: -5px;
  line-height: 0;
}
</style>
