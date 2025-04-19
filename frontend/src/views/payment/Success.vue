<template>
    <div class="text-center">
        <h1>Success</h1>
    </div>
</template>

<script>
import {useCartStore} from '@/stores/CartStore'
export default{
    async mounted(){
    /*const urlParams= new URLSearchParams(window.location.search);
    const sessionId=urlParams.get('session_id');
    console.log('stripe session Id:', sessionId);

    if(sessionId){
        alert('payment successful! your order is confirmed')
        const cartStore=useCartStore();
        cartStore.clearCart();
    }else{
        alert('payment not verified')
    }*/
   }
}
</script>