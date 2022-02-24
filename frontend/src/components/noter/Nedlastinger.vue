<template>
  <h3>Nedlastinger</h3>
  <Button
    icon="pi pi-arrow-circle-left"
    label="Tilbake"
    @click="$router.back()"
    style="margin-right: 4px"
    class="p-button-warning"
  />
  <Button
    icon="pi pi-database"
    label="Parse logg"
    @click="parseLog()"
    style="margin-right: 4px"
    class="p-button-success"
  />
  <h4>Totalt {{ numLogLines }} nedlastinger.</h4>
</template>

<script>
import NedlastingService from "@/service/NedlastingService";

export default {
  name: "Nedlastinger",
  data() {
    return {
      numLogLines: 0,
    };
  },
  methods: {
    parseLog() {
      NedlastingService.parseLog()
        .then((res) => this.handleSuccess(res, "Logg er lest inn"))
        .catch((error) => this.handleError(error));
    },
    handleSuccess(res, text) {
      console.log(res);
      this.numLogLines = res;
      this.$toast.add({
        severity: "success",
        summary: text,
        detail: "Logg med " + this.numLogLines + " linjer er lest inn.",
        life: 3000,
      });
    },
    handleError(error) {
      this.$toast.add({
        severity: "error",
        summary: "Feil",
        detail: error,
        life: 3000,
      });
    },
  },
};
</script>

<style></style>
