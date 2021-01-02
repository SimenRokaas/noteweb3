import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import axios from "axios";
import VueAxios from "vue-axios";

import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Password from "primevue/password";
import PickList from "primevue/picklist";
import SplitButton from "primevue/splitbutton";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

Vue.use(ToastService);

Vue.use(VueAxios, axios);

Vue.component("AutoComplete", AutoComplete);
Vue.component("Button", Button);
Vue.component("Checkbox", Checkbox);
Vue.component("Column", Column);
Vue.component("DataTable", DataTable);
Vue.component("Dialog", Dialog);
Vue.component("InputText", InputText);
Vue.component("Message", Message);
Vue.component("MultiSelect", MultiSelect);
Vue.component("PickList", PickList);
Vue.component("Password", Password);
Vue.component("SplitButton", SplitButton);
Vue.component("Toast", Toast);

import "primevue/resources/themes/nova/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import VueCookies from "vue-cookies";
Vue.use(VueCookies);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  router: router,
}).$mount("#app");
