<template>
    <div class="container mt-4">
        <div class="row">
            <div class="col-12 text-center">
                <h4>Add New Product</h4>
            </div>
        </div>
        <div class="row">
            <div class="col-3"></div>
            <div class="col-12">
                <form class="row g-3 col-12 text-start">
                    <div class="form-group">
                        <label>Category</label>
                     <select class="form-select" v-model="category" required>
                      <option selected v-for="category in categories" :key="category.id"
                      :value="category.id" >{{ category.name }}</option>
                     </select>
                    </div>
                    <div class="form-group col-12 text-capitalize">
                        <label>Name</label>
                        <input type="text" v-model="name" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Discription</label>
                        <input type="text" v-model="discription" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Product features</label>
                        <textarea class="form-control" row="3" v-model.trim="richDiscription">02</textarea>
                    </div><br/>
                    <div class="form-group col-12">
                        <label>Image</label>
                        <input type="file"
                         ref="image" name="image"
                          @change="handleFileUpload"  
                          class="form-control-file">
                    </div>
                    <div class="form-group col-12">
                        <label>Affiliate link</label>
                        <input type="text" v-model="brand" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Price</label>
                        <input type="number"  v-model="price" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Count Instoct</label>
                        <input type="number" v-model="countInStock" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Rating</label>
                        <input type="number" v-model="rating" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Reviews</label>
                        <input type="number" v-model="numReviews" class="form-control">
                    </div>
                    <div class="form-group col-12">
                        <label>Feature</label>
                        <input type="text" v-model="isFeature" class="form-control">
                    </div>
                    
                    <button type="button" class="btn btn-primary" @click="addProduct()">ADD PRODUCT</button>
                </form>
            </div>
            <div class="col-3"></div>
            
        </div>
        <!--the form-->
    </div>
</template>

<script>
import axios from 'axios'
export default{
  data(){
    return{
        id:null,
        category:null,
        name:null,
        discription:null,
        richDiscription:null,
        image:null,
        brand:null,
        price:null,
        countInStock:null,
        rating:null,
        numReviews:null,
        isFeature:null,





    }
  },
  props:['baseURL','products','categories'],

  methods:{
        handleFileUpload(event){
    this.file=this.$refs.image.files[0];
    console.log(this.file)

    },
  async  addProduct(){
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
      formData.append("category",this.category)
      formData.append("discription",this.discription)
      formData.append("richDiscription",this.richDiscription)
      formData.append('image',this.$refs.image.files[0]);
      formData.append("brand",this.brand)
      formData.append("price",this.price)
      formData.append("countInStock",this.countInStock)
      formData.append("rating",this.rating)
      formData.append("numReviews",this.numReviews)
      formData.append("feature",this.feature)

      console.log(formData)

      await axios({
      method:'post',
      url:this.baseURL + "products/",
      body:formData,
      data:formData,
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`,
        'Content-Type':'multipart/form-data'
      }
     }).then(res=>{
        this.$emit("fetchData");
      this.$router.push({name :"AdminProduct"});
      this.$swal({
        text:"product added successfully!",
        icon:"success",
        closeOnClickOutside:false,
      });
     }).catch(err => console.log(err))

        
    }
}
  }


</script>