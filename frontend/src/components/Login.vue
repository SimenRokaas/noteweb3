<template>
  <div>
    <h2>Login</h2>
    <div class="p-fluid" style="margin-bottom: 5px">
      Du må logge på notearkivet separat. Oppgi passord nedenfor.
    </div>

    <div class="p-fluid">
      <div style="margin-bottom: 5px">
        <Password
          v-model="passord"
          autofocus
          :feedback="false"
          @keyup.enter.native="login"
        />
      </div>
    </div>

    <div
      v-if="passordFeil"
      class="p-grid p-fluid"
      style="margin-bottom: 5px; color: red"
    >
      Feil/ukjent passord. Prøv igjen!
    </div>
    <div>
      <Button
        label="OK"
        icon="pi pi-check"
        @click="login"
        class="p-button-success"
      />
    </div>
  </div>
</template>

<script>
import AuthService from "@/service/AuthService";

export default {
  name: "Login",
  data() {
    return {
      passord: null,
      passordFeil: false,
    };
  },
  methods: {
    login(e) {
      e.preventDefault();
      AuthService.login({
        bruker: "ingen",
        passord: this.passord,
      })
        .then((user) => {
          console.log("Logget inn med rolle '" + user.rolle + "'");
        })
        .catch(() => {
          this.passordFeil = true;
        });
    },
  },
};
</script>
