<template>
    <div class="div_class">
        <h3>you will be directed to a payment page</h3>
        <div class="alert alert-primary">
            while making payment use card number 4242 4242 4242 and enter random date and 
            cvv(3 digit)</div>
            <button class="checkout_button" @click="goToCheckOut">make payment</button>
            {{this.orderItems}}

    </div>
</template>
<script>
import axios from 'axios'
export default{
    setup(){
        return{
            stripeApiToken:"pk_test_51QezySJRvycA08QovbT1WKFZdnHc6ucWV1F8o47i2oxCvDlBty2VUYTazwM0S1hChabm5MYE5I2yJLpWKpjkuxkO00JFwgCneJ",
            stripe:"",
            token:null,
            orderItems:[],
            order:[],
            orderId:null,
           
        }
    },
    name:'CheckOut',
    props:['baseURL'],
    methods:{
      async  getAllItems(){
          await  axios.get(`${this.baseURL}orders/?token=${this.token}`)
   .then((response)=> {
        this.order=response.data;
    if(response.status==200){
    this.orderItems=this.order.flatMap(order=> order.orderItems);
    }
   }).catch((err)=> console.log('err',err))
},


        goToCheckOut() {
    // Pass product details to the backend
    axios.post(`${this.baseURL}orders/create-checkout-session/?token=${this.token}`, {
         items: this.orderItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price
        }))
    }).then((response) => {
        localStorage.setItem('sessionId', response.data.sessionId);
        console.log('sessionId', response.data);
        this.stripe.redirectToCheckout({
            sessionId: response.data.sessionId,
        });
    }).catch((err) => console.log(err));
         }
        },


    mounted(){
        this.getAllItems();
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