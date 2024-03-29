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
      <div class="p-fluid" v-if="dialogNote">
        <div v-for="col in allColumns">
          <div style="margin-bottom: 5px">
            <label :for="col.field">{{ col.header }}</label>
            <InputText
              v-if="col.field === 'ArkivNr'"
              :id="col.field"
              v-model="dialogNote[col.field]"
              :disabled="!kanSkrive || mode === 'ENDRE'"
              autocomplete="off"
            />
            <AutoComplete
              v-else
              :id="col.field"
              v-model="dialogNote[col.field]"
              :suggestions="autocompleteSuggestions"
              :disabled="!kanSkrive"
              @complete="autocompleteSearch($event, col.field)"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div v-if="kanSkrive">
          <Button
            v-if="visAvbrytKnapp"
            label="Avbryt"
            icon="pi pi-times"
            @click="skjulNoteDialog"
            class="p-button-warning"
            autofocus
          />
          <Button
            v-if="visSlettKnapp"
            label="Slett"
            icon="pi pi-times"
            @click="visBekreftSlettDialog"
            class="p-button-danger"
          />
          <Button
            label="Lagre"
            icon="pi pi-check"
            @click="lagreNote"
            class="p-button-success"
          />
        </div>
        <div v-else>
          <Button
            label="Lukk"
            icon="pi pi-check"
            @click="skjulNoteDialog"
            class="p-button-success"
            autofocus
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      :visible.sync="visBekreftSlett"
      :style="{ width: '600px' }"
      header="Bekreft sletting"
      :modal="true"
    >
      <div class="p-grid p-fluid">
        Er du sikker på at du vil slette note {{ this.arkNrNaa }}?
      </div>

      <template #footer>
        <div>
          <Button
            label="Avbryt"
            icon="pi pi-times"
            @click="visBekreftSlett = false"
            class="p-button-warning"
            autofocus
          />
          <Button
            label="OK"
            icon="pi pi-check"
            @click="slettNote"
            class="p-button-success"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import NoteService from "@/service/NoteService";
import NoteskannLenkerDialog from "./NoteskannLenkerDialog";

export default {
  name: "NoteDialog",
  components: { NoteskannLenkerDialog },
  props: [
    "erSynlig",
    "mode",
    "dialogNote",
    "arkNrNaa",
    "noter",
    "valgtNote",
    "kanSkrive",
    "allColumns",
    "visAvbrytKnapp",
    "visSlettKnapp",
  ],
  data() {
    return {
      autocompleteSuggestions: null,
      visBekreftSlett: false,
      arkivNrIToast: "",
      autolayout: true,
    };
  },
  methods: {
    getHeader() {
      return "Notedetaljer arkivnr " + this.arkNrNaa;
    },
    visBekreftSlettDialog() {
      this.visBekreftSlett = true;
    },
    autocompleteSearch(event, field) {
      const fieldArr = this.noter.map((n) => n[field]).filter((f) => f != null);
      const startsWith = fieldArr.filter((f) =>
        f.toLowerCase().startsWith(event.query.toLowerCase())
      );
      const includes = fieldArr.filter((f) =>
        f.toLowerCase().includes(event.query.toLowerCase())
      );
      const list = [...new Set(startsWith.concat(includes))]; // set for unique values
      this.autocompleteSuggestions = list.map((it) =>
        it.length > 50 ? it.substring(0, 50) + "..." : it
      );
    },
    slettNote() {
      this.arkivNrIToast = this.dialogNote.ArkivNr;
      this.visBekreftSlett = false;
      NoteService.delete(this.dialogNote)
        .then((res) => this.handleSuccess(res, "Slettet"))
        .catch((error) => this.handleError(error));
      this.skjulNoteDialog();
    },
    lagreNote() {
      this.arkivNrIToast = this.dialogNote.ArkivNr;
      if (this.mode === "NY") {
        const finnes = this.noter.find(
          (n) => n.ArkivNr === this.dialogNote.ArkivNr
        );
        if (finnes !== undefined) {
          this.finnesAllerede();
        } else {
          NoteService.create(this.dialogNote)
            .then((res) => this.handleSuccess(res, "Opprettet"))
            .catch((error) => this.handleError(error));
        }
      } else {
        NoteService.update(this.dialogNote)
          .then((res) => this.handleSuccess(res, "Oppdatert"))
          .catch((error) => this.handleError(error));
      }
      this.skjulNoteDialog();
    },
    handleSuccess(res, text) {
      const indexOfUpdatedNote = this.noter.findIndex(
        (n) => n.ArkivNr === this.arkNrNaa
      );
      if (text === "Opprettet" || text === "Oppdatert") {
        const data = JSON.parse(res.config.data);
        if (text === "Oppdatert") {
          this.noter.splice(indexOfUpdatedNote, 1, data);
        }
        if (text === "Opprettet") {
          this.noter.unshift(data); // add at beginning of array because of default sorting
        }
      }
      if (text === "Slettet") {
        this.noter.splice(indexOfUpdatedNote, 1);
      }
      this.$toast.add({
        severity: "success",
        summary: text,
        detail: "Note " + this.arkivNrIToast + " " + text.toLowerCase() + "!",
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
    finnesAllerede() {
      this.$toast.add({
        severity: "error",
        summary: "Feil",
        detail: "Noten finnes allerede!",
        life: 3000,
      });
    },
    skjulNoteDialog() {
      this.$emit("skjul-notedialog");
    },
  },
};
</script>
