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
      <ProgressBar
        v-show="visProgressBar"
        mode="indeterminate"
        style="margin-bottom: 8px"
      />
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
      <ProgressBar
        v-show="visProgressBar"
        mode="indeterminate"
        style="margin-top: 8px"
      />
    </Dialog>
  </div>
</template>

<script>
import download from "downloadjs";
import NoteService from "@/service/NoteService";

export default {
  name: "NoteskannLenker",
  props: ["erSynlig", "arkivNr", "lenker"],
  data() {
    return {
      visProgressBar: false,
    };
  },
  methods: {
    getHeader() {
      return "Skannede noter for arkivnr " + this.arkivNr;
    },
    skjulNoteskannLenkerDialog() {
      this.$emit("skjul-noteskannlenkerdialog");
    },
    getNote(linkObj) {
      this.visProgressBar = true;
      NoteService.getNote(linkObj)
        .then((response) => {
          const contentType = response.headers["content-type"];
          download(response.data, linkObj.text, contentType);
          this.visProgressBar = false;
        })
        .catch((error) => {
          console.error(error);
          this.visProgressBar = false;
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
    isEmpty(obj) {
      return Object.keys(obj).length === 0;
    },
  },
};
</script>
