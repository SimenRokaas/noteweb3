<template>
  <div id="app">
    <Toast position="top-left" />
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "TjkNoter"
};
</script>

<style scoped>
#app {
  font-family: Verdana, Arial, "Avenir", Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
.app-container {
  text-align: center;
}
body #app .p-button {
  margin-left: 0.2em;
}
form {
  margin-top: 2em;
}
</style>
