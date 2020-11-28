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
      <div v-if="typeof lenker === 'string'">
        {{ lenker }}
      </div>
      <div v-else v-for="lenke in lenker">
        <a :href="lenke.href" target="_blank">{{ lenke.text }}</a>
      </div>
      <p />
      <Button
        label="OK"
        icon="pi pi-check"
        @click="skjulNoteskannLenkerDialog"
        class="p-button-success"
      />
    </Dialog>
  </div>
</template>

<script>
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
  },
};
</script>
