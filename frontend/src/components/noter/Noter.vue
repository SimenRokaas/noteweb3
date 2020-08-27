<template>
  <div>
    <DataTable
      ref="dt"
      class="p-datatable-noter"
      :value="noter"
      :filters="filters"
      :loading="loading"
      auto-layout
      sort-field="arkivNr"
      :sort-order="-1"
      :rows="15"
      :rows-per-page-options="[15, 30, 60, 100]"
      :row-hover="true"
      :paginator="true"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="Viser {first} til {last} av {totalRecords} noter"
      :resizable-columns="true"
      export-filename="noter"
      csv-separator="|"
      selection-mode="single"
      :selection.sync="valgtNote"
      @row-select="onRowSelect"
      dataKey="arkivNr"
    >
      <template #header>
        <table>
          <tr>
            <td style="float: left; margin-right: 8px">
              <img
                src="Tønsberg-Janitsjarkorps-logo-600px-300x300.jpg"
                alt="TJK logo"
                width="50"
              />
            </td>
            <td style="float: left; margin-right: 8px">
              {{ title }}
            </td>
            <td style="float: left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="filters['global']"
                placeholder="Fritekst søk"
                size="50"
              />
              <span style="font-size: 24px; color: red; margin-left: 20px" id="betaTekst" class="rainbow"
                >BETA</span
              >
            </td>
            <td style="float: right">
              <span v-if="erDev">
                <Checkbox
                  id="toggleKanSkrive"
                  v-model="kanSkrive"
                  :binary="true"
                />
                <label
                  for="toggleKanSkrive"
                  class="p-checkbox-label"
                  style="font-size: 9px; margin-right: 4px"
                >
                  Kan skrive (DEV)
                </label>
              </span>
              <Checkbox id="showAllCols" v-model="showAllCols" :binary="true" />
              <label
                for="showAllCols"
                class="p-checkbox-label"
                style="font-size: 14px; margin-right: 4px"
              >
                Vis alle kolonner
              </label>
              <Button
                icon="pi pi-plus"
                label="Legg til"
                @click="leggTilNote"
                style="margin-right: 4px"
                v-show="kanSkrive"
                class="p-button-success"
              />
              <Button
                icon="pi pi-external-link"
                label="Eksport"
                @click="exportCSV($event)"
                class="p-button-success"
              />
            </td>
          </tr>
        </table>
      </template>
      <template #empty>
        Ingen treff.
      </template>
      <template #loading>
        Laster noter, vent litt...
      </template>
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="true"
      />
    </DataTable>

    <Dialog
      :visible.sync="visDialog"
      :style="{ width: '600px' }"
      header="Notedetaljer"
      :modal="true"
    >
      <div class="p-grid p-fluid" v-if="dialogNote">
        <div v-for="col in allColumns">
          <div style="margin-bottom: 5px">
            <label :for="col.field">{{ col.header }}</label>
            <InputText
              :id="col.field"
              v-model="dialogNote[col.field]"
              :disabled="!kanSkrive || col.field === 'arkivNr'"
              autocomplete="off"
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
            @click="visDialog = false"
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
            label="OK"
            icon="pi pi-check"
            @click="visDialog = false"
            class="p-button-success"
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
import RolleService from "@/service/RolleService";

const arkivNr = { field: "arkivNr", header: "Arkivnr" };
const kolTittel1 = { field: "tittel1", header: "Tittel" };
const kolTittel2 = { field: "tittel2", header: "Tittel 2" };
const kolSolo = { field: "soloInstrument", header: "Solo-instr" };
const kolDurata = { field: "durata", header: "Durata" };
const kolKategori1 = { field: "kategori1", header: "Kategori" };
const kolKategori2 = { field: "kategori2", header: "Kategori 2" };
const kolKategori3 = { field: "kategori3", header: "Kategori 3" };
const kolKommentar = { field: "kommentar", header: "Kommentar" };

const allCols = [
  arkivNr,
  kolTittel1,
  kolTittel2,
  kolSolo,
  kolDurata,
  kolKategori1,
  kolKategori2,
  kolKategori3,
  kolKommentar
];
const minCols = [arkivNr, kolTittel1, kolKategori1, kolKommentar];

export default {
  name: "Noter",
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      columnOptions: null,
      allColumns: allCols,
      showAllCols: false,
      filters: {},
      loading: true,
      noter: [],
      kanSkrive: false,
      valgtNote: null,
      dialogNote: {},
      visDialog: false,
      visSlettKnapp: true,
      visAvbrytKnapp: false,
      visBekreftSlett: false,
      mode: "VIS",
      arkNrNaa: null,
      erDev: process.env.NODE_ENV === "development"
    };
  },
  computed: {
    columns() {
      return this.showAllCols ? allCols : minCols;
    }
  },
  created() {
    this.columnOptions = this.showAllCols ? allCols : minCols;
  },
  mounted() {
    this.title = process.env.VUE_APP_TITLE;
    NoteService.fetchNoter().then(data => {
      this.noter = data;
      this.loading = false;
    });
    // hvis vi kan nå en styre-side på tjk.no så har vi skrive-rettighet
    RolleService.fetchRolle().then(data => {
      this.kanSkrive = data;
    });
  },
  methods: {
    exportCSV() {
      this.$refs.dt.exportCSV();
    },
    onRowSelect(event) {
      this.arkNrNaa = event.data.arkivNr;
      this.mode = "ENDRE";
      this.dialogNote = { ...event.data };
      this.visSlettKnapp = true;
      this.visAvbrytKnapp = true;
      this.visDialog = true;
    },
    leggTilNote() {
      this.mode = "NY";
      this.arkNrNaa = this.genererArkivnr();
      this.dialogNote = {
        arkivNr: this.arkNrNaa,
        tittel1: ""
      };
      this.visSlettKnapp = false;
      this.visAvbrytKnapp = true;
      this.visDialog = true;
    },
    visBekreftSlettDialog() {
      this.visBekreftSlett = true;
    },
    slettNote() {
      this.visBekreftSlett = false;
      NoteService.delete(this.dialogNote)
        .then(res => this.handleSuccess(res, "Slettet"))
        .catch(error => this.handleError(error));
      this.visDialog = false;
      this.dialogNote = null;
      this.valgtNote = null;
    },
    lagreNote() {
      if (this.mode === "NY") {
        NoteService.create(this.dialogNote)
          .then(res => this.handleSuccess(res, "Opprettet"))
          .catch(error => this.handleError(error));
      } else {
        NoteService.update(this.dialogNote)
          .then(res => this.handleSuccess(res, "Oppdatert"))
          .catch(error => this.handleError(error));
      }
      this.visDialog = false;
      this.dialogNote = null;
      this.valgtNote = null;
    },
    handleSuccess(res, text) {
      const indexOfUpdatedNote = this.noter.findIndex(
        n => n.arkivNr === this.arkNrNaa
      );
      if (text === "Opprettet" || text === "Oppdatert") {
        const data = JSON.parse(res.config.data);
        if (text === "Oppdatert") {
          this.noter.splice(indexOfUpdatedNote, 1, data);
        }
        if (text === "Opprettet") {
          this.noter.splice(indexOfUpdatedNote, 0, data);
        }
      }
      if (text === "Slettet") {
        this.noter.splice(indexOfUpdatedNote, 1);
      }
      this.$toast.add({
        severity: "success",
        summary: text,
        detail: "Note " + this.arkNrNaa + " " + text.toLowerCase() + "!",
        life: 3000
      });
    },
    handleError(error) {
      this.$toast.add({
        severity: "error",
        summary: "Feil",
        detail: error,
        life: 3000
      });
    },
    genererArkivnr() {
      let currentMax = Math.max(...this.noter.map(n => n.arkivNr));
      return currentMax + 1;
    }
  }
};
</script>

<style>
.p-dropdown {
  float: left;
}

.p-paginator-current {
  float: right;
}

.p-datatable-header {
  border: 0 none;
  padding: 12px;
  text-align: left;
  font-size: 20px;
}

.rainbow {
  /* Font options */
  text-shadow: 2px 2px 4px #000000;
  font-size:40px;

  /* Chrome, Safari, Opera */
  -webkit-animation: rainbow 5s infinite;

  /* Internet Explorer */
  -ms-animation: rainbow 5s infinite;

  /* Standard Syntax */
  animation: rainbow 5s infinite;
}

/* Chrome, Safari, Opera */
@-webkit-keyframes rainbow{
  0%{color: orange;}
  10%{color: purple;}
  20%{color: red;}
  30%{color: CadetBlue;}
  40%{color: yellow;}
  50%{color: coral;}
  60%{color: green;}
  70%{color: cyan;}
  80%{color: DeepPink;}
  90%{color: DodgerBlue;}
  100%{color: orange;}
}

/* Internet Explorer */
@-ms-keyframes rainbow{
  0%{color: orange;}
  10%{color: purple;}
  20%{color: red;}
  30%{color: CadetBlue;}
  40%{color: yellow;}
  50%{color: coral;}
  60%{color: green;}
  70%{color: cyan;}
  80%{color: DeepPink;}
  90%{color: DodgerBlue;}
  100%{color: orange;}
}

/* Standar Syntax */
@keyframes rainbow{
  0%{color: orange;}
  10%{color: purple;}
  20%{color: red;}
  30%{color: CadetBlue;}
  40%{color: yellow;}
  50%{color: coral;}
  60%{color: green;}
  70%{color: cyan;}
  80%{color: DeepPink;}
  90%{color: DodgerBlue;}
  100%{color: orange;}
}

</style>
