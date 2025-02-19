<template>
    <div class="page">
        <h1>404: Page Not Found</h1>
    <hr/>
    <RouterLink class="dropdown-item" :to="{name:'home'}">
    <h3>has moving to other site</h3>
            </RouterLink>
    </div>
    
</template>
<script>
export default{
    name:"Page"
}
</script>
<style scoped>
.page{
    text-align: center;
    position: relative;
    top: 120px;
}
a{
    text-decoration:underline;
    color: brown;
}
</style>