<template>
  <div id="app" style="margin-top: 0">
    <Topp />
    <router-view></router-view>
  </div>
</template>

<script>
import Topp from "@/components/Topp";

export default {
  name: "TjkNoter",
  components: {
    Topp,
  },
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
