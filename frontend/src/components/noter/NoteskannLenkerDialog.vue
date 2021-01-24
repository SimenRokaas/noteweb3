<template>
  <div>
    <!-- closable=false fordi klikk vil sette prop koblet til parent, ikke lov i vue -->
    <Dialog
      :visible="erSynlig"
      :style="{ width: '600px' }"
      :header="getHeader()"
      modal
      :closable="false"
    >
      <i
        v-if="isEmpty(lenker)"
        class="pi pi-spin pi-spinner"
        style="font-size: 3rem"
      ></i>
      <div v-if="typeof lenker === 'string'">
        {{ lenker }}
      </div>
      <div v-else v-for="lenke in lenker">
        <Button
          :label="lenke.text"
          class="p-button-link"
          @click="getNote(lenke)"
        />
      </div>
      <p />
      <Button
        label="Lukk"
        icon="pi pi-check"
        @click="skjulNoteskannLenkerDialog"
        class="p-button-success"
        autofocus
      />
    </Dialog>
  </div>
</template>

<script>
import download from "downloadjs";

export default {
  name: "NoteskannLenker",
  props: ["erSynlig", "arkivNr", "lenker"],
  methods: {
    getHeader() {
      return "Skannede noter for arkivnr " + this.arkivNr;
    },
    skjulNoteskannLenkerDialog() {
      this.$emit("skjul-noteskannlenkerdialog");
    },
    getNote(link) {
      console.log("Downloading " + link.href + " ...");
      const x = new XMLHttpRequest();
      x.open("GET", link.href, true);
      x.responseType = "blob";
      x.onload = function (e) {
        download(e.target.response, link.text, "application/pdf");
      };
      x.send();
    },
    handleError(error) {
      this.$toast.add({
        severity: "error",
        summary: "Feil",
        detail: error,
        life: 3000,
      });
    },
    isEmpty(obj) {
      return Object.keys(obj).length === 0;
    },
  },
};
</script>
