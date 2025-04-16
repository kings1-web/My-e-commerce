import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartCount:0,
    userId:localStorage.getItem("userId") || null,
    cart: localStorage.getItem('cart') || [],
    billingAddress:{
        shippingAdress1:'',
        shippingAdress2:'',
        city:'',
        zip:'',
        country:'',
        phone:'',
        user:localStorage.getItem('userId') || null
    }
  }),
  getters: {
    totalPrice: (state) => {
      return state.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
        totalItems: (state) => {
         return state.cart.reduce((total, item) => total + item.quantity, 0);
    },
   
    
  },
  actions: {
    addToCart(product) {
      //check if the product is already in the cart
      const existingProduct = this.cart.find((item) => item.id === product.id);
      if (existingProduct) {
        //increase the quantity if the product exist in the cart
        existingProduct.quantity += 1;
      } else {
        //add the product to the cart with an initial quantity of 1
        this.cart.push({ ...product, quantity: 1 });
      }
      this.cartCount=this.totalItems
      this.saveCart();
    },
    loadCartForUser(userId){
    this.userId=userId;
    const useCart=JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
    this.cart=useCart;
    this.cartCount=this.totalItems;
    },
    updateBillingAddress(address){
        this.billingAddress={...address};
    },
    removeFromCart(product) {
      this.cart = this.cart.filter((item) => item.id !== product);
      this.cartCount=this.totalItems;
      this.saveCart();
    },
    saveCart() {
    if(this.userId){
      localStorage.setItem(`cart_${this.userId}`, JSON.stringify(this.cart))
    }
    
    },
    setCartItems(items){
    this.cart=items;
    this.cartCount=this.totalItems;
    this.saveCart();
    },
    clearCart() {
      this.cart = [];
     this.cartCount=this.totalItems;
      if(this.userId){
        localStorage.removeItem(`cart_${this.userId}`);
        }
    },
    
    resetCart(){
      this.cart=[];
      this.cartCount=0;
      if(this.userId){
      localStorage.removeItem(`cart_${this.userId}`);
      }
    }
  },
});
