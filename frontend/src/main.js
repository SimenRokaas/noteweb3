import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import Message from "primevue/message";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

Vue.use(ToastService);

Vue.component("Message", Message);
Vue.component("InputText", InputText);
Vue.component("Button", Button);
Vue.component("Toast", Toast);
Vue.component("DataTable", DataTable);
Vue.component("Column", Column);

import "primevue/resources/themes/nova-light/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router
}).$mount("#app");
