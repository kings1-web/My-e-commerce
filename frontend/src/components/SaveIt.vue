<template>

</template>
<script>
export default{
    methods:{
        removeItem(){
            //retrieve the current cart from localStorage
      let cartData=JSON.parse(localStorage.getItem('cart')) || [];
      //remove the specific item by fillterring it out
   cartData=cartData.filter(item=>item.id !== itemId);
     //save the updated cart back to localStorage
     localStorage.setItem('cart',JSON.stringify(cartData));

     //optional: update local cart stste (if applicable)
     this.cartData=cartData

        },
        
    
        

    }
};
</script>