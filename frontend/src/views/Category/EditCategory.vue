<template>
    <div class="container">
        <div class="row">
            <div class="col-12 text-center">
                <h4 class="pt-3">Edit Category</h4>
            </div>
        </div>
       
        <div class="row">
            <div class="col-3"></div>
            <div class="col-12">
                <form v-if="category">
                    <div class="form-group">
                        <label>Category Name</label>
                        <input type="text" class="form-control" v-model="category.name" require/>
                    </div>
                    <div class="form-group">
                        <label>discription</label>
                        <input type="text" row="3" class="form-control" v-model="category.icon" require/>
                    </div>
                    <div class="form-group">
                        <label>imageFile</label><br/>
                        <input 
                        type="file" class="form-control-file"
                        ref="image"
                        @change="handleFileUpload"
                        name="image"

                            require/>
                    </div><br/>
                    <button type="button" class="btn btn-primary" @click="editCategory">submit</button>
                </form>
            </div>
            <div class="col-3"></div>
        </div>
    </div>
</template>

<script>
import Category from './Category.vue';
import axios from 'axios'

   export default{
     data(){
        return{
      category:null,
            id:null
        }
     },
     props:["baseURL","categories"],
     methods:{
        handleFileUpload(e){
      this.file=this.$refs.image.files[0];
      console.log(this.file)
        },

      async  editCategory(){
        console.log('category', this.category)

        const formData = new FormData();
         

      formData.append("name",this.category.name);
      formData.append("icon",this.category.icon)
      formData.append("color",this.color)
      formData.append('image',this.$refs.image.files[0]);

      console.log(formData)


        delete this.category['products']
           await axios.put(`${this.baseURL}categories/${this.id}`,
           formData,{
            headers:{
                Authorization:`Bearer ${localStorage.getItem('token')}`
            }
           })
           .then(()=>{
            this.$emit('fetchData')
            this.$router.push({name: 'Category'})
            this.$swal({
                text:"CATEGORY UPDATED SUCCESSFULLY",
                icon:"success"
            })
           }).catch(err => console.log('err', err))
                
        
       
   

        }

     },
     mounted(){
        this.id=this.$route.params.id;
        this.category=this.categories.find(category => category.id==this.id)
     }
    }

</script>