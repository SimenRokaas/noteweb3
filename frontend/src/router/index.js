import Vue from "vue";
import Router from "vue-router";

import Noter from "@/components/noter/Noter";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "noter",
      component: Noter
    }
  ]
});
