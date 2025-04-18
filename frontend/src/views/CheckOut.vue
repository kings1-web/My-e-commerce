<template>
    <div class="div_class">
        <h3>you will be directed to a payment page</h3>
        <div class="alert alert-primary">
            while making payment use card number 4242 4242 4242 and enter random date and 
            cvv(3 digit)</div>
            <button class="checkout_button" @click="goToCheckOut">make payment</button>

    </div>
</template>
<script>
import axios from 'axios'
import { useCartStore } from '@/stores/CartStore';
export default{
    setup(){
        return{
            stripeApiToken:"pk_test_51QezySJRvycA08QovbT1WKFZdnHc6ucWV1F8o47i2oxCvDlBty2VUYTazwM0S1hChabm5MYE5I2yJLpWKpjkuxkO00JFwgCneJ",
            stripe:null,
            token:localStorage.getItem('token'),
           
        }
    },
    computed:{
       cartStore(){
        return useCartStore();
       },
       
    },
    name:'CheckOut',
    props:['baseURL'],
    methods:{
     
       /* goToCheckOut() {
    // Pass product details to the backend
    axios.post(`${this.baseURL}orders/create-checkout-session/?token=${this.token}`, {
         items: this.cartStore.cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price
        })),
        billingAddress:this.cartStore.billingAddress,
    }).then((response) => {
        localStorage.setItem('sessionId', response.data.sessionId);
        console.log('sessionId', response.data);
        this.stripe.redirectToCheckout({
            sessionId: response.data.sessionId,
        });
    }).catch((err) => console.log(err));
         }*/
        },


    mounted(){
        this.token=localStorage.getItem('token');
        this.stripe=window.Stripe(this.stripeApiToken)
      
    }
}

</script>
<style scoped>
.alert{
    width: 50%;
}
.div_class{
    margin-top: 5%;
    margin-left: 30%;
}
.checkout_button{
    background-color: #5d3dec;
    margin:10px;
    color:#fff
}
</style>