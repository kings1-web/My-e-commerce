<template>
    <div class="text-center">
        <h1>Success</h1>
    </div>
</template>

<script>
import {useCartStore} from '@/stores/CartStore'
export default{
     mounted(){
        const sessionId=this.$route.query.session_id
    console.log('stripe session Id:', sessionId);

    fetch(`https://royalgoods.onrender.com/api/v1/orders/session/${sessionId}`,{
        headers:{
            Authorization: `bearer ${localStorage.getItem('token')}`
        }
    }).then(res=>res.json())
       .then(data=>{
        console.log('stripe session:', data)
       })
       .catch(err=> console.error('Failed to fectch session id'))

    if(sessionId){
        alert('payment successful! your order is confirmed')
        const cartStore=useCartStore();
        cartStore.clearCart();
    }else{
        alert('payment not verified')
    }
   }
}
</script>