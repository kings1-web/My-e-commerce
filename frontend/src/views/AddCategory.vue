<template>
  <div class="container bg-dark text-white">
    <div class="row">
      <div class="text-center">
        <h3>add category</h3>
      </div>
    </div>
    <div class="row">
      <form id="form">
        <div class="form-group">
          <label> name</label>
          <input
            type="text"
            name="name"
            class="form-control"
            aria-describedby="name"
            v-model="name"
          />
        </div>
        <div class="form-group">
          <label> discription</label>
          <textarea
            type="text"
            name="icon"
            class="form-control"
            aria-describedby="icon"
            v-model="icon"
          ></textarea>
        </div>
        <div class="form-group">
          <div class="mb-3">
            <label for="formFile" class="form-label">image</label>
            <input
              type="file"
              name="image"
              ref="image"
              class="form-control-file"
              @change="handleFileUpload"
              
            />
          </div>
        </div>
        
        <button type="button" class="btn btn-primary mb-3" @click="addCategory">
          submit
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
//import Category from "./Category/Category.vue";

export default {
//component:{Category},

  data() {
     return{
      name:null,
      icon:null,
      color:null,
      image:null,


     }
    
  },
props:["baseURL", "categories"],
     methods: {
     handleFileUpload(e){
      this.file=this.$refs.image.files[0];
      console.log(this.file)

    },
      

     async addCategory(){
         if(!this.file){
          this.$swal({
            text:"Select a file first",
            icon:"warning",
            closeOnClickOutside:false,
          })
          return;
         }
       
      const formData = new FormData();
         

      formData.append("name",this.name);
      formData.append("icon",this.icon)
      formData.append("color",this.color)
      formData.append('image',this.$refs.image.files[0]);

      console.log(formData)

     await axios({
      method:'post',
      url:this.baseURL + "categories/",
      body:formData,
      data:formData,
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
     }).then(res=>{
      this.$emit("fetchData");
      this.$router.push({name :"Category"});
      this.$swal({
        text:"Category added successfully!",
        icon:"success",
        closeOnClickOutside:false,
      });
     }).catch(err => console.log(err))

}
},
mounted(){
 // if(!localStorage.getItem('token')){
 //   this.$router.push({name : "signin"});
 // }
}
}
</script>

<style scoped></style>
