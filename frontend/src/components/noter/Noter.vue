<template>
  <div>
    <Dialog
      :visible="!kanLese && !kanSkrive"
      :style="{ width: '600px' }"
      header="Logg inn"
      :modal="true"
    >
      <div class="p-grid p-fluid" style="margin-bottom: 5px">
        Du må logge på notearkivet separat. Oppgi passord nedenfor.
      </div>

      <div class="p-grid p-fluid">
        <div style="margin-bottom: 5px">
          <Password v-model="passord" :feedback="false" @keyup.enter.native="settRolle" />
        </div>
      </div>

      <template #footer>
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
            @click="settRolle"
            class="p-button-success"
          />
        </div>
      </template>
    </Dialog>

    <DataTable
      :filters="filters"
      :loading="loading"
      :paginator="true"
      :resizable-columns="true"
      :reorderableColumns="true"
      :row-hover="true"
      :rows="15"
      :rows-per-page-options="[15, 30, 60, 100]"
      :selection.sync="valgtNote"
      :sort-order="-1"
      :value="noter"
      @row-select="onRowSelect"
      auto-layout
      class="p-datatable-noter"
      csv-separator="|"
      current-page-report-template="Viser {first} til {last} av {totalRecords} noter"
      dataKey="ArkivNr"
      export-filename="noter"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      ref="dt"
      selection-mode="single"
      sort-field="arkivNr"
      v-if="kanLese || kanSkrive"
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
              <span style="horiz-align: left; font-size: 12px">
                v2020.09.04
              </span>
            </td>
            <td style="float: left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="filters['global']"
                placeholder="Fritekst søk"
                size="50"
              />
            </td>
            <td style="float: right">
              <span v-if="erDev">
                <Checkbox id="toggleKanLese" v-model="kanLese" :binary="true" />
                <label
                  for="toggleKanLese"
                  class="p-checkbox-label"
                  style="font-size: 9px; margin-right: 4px"
                >
                  Kan lese (DEV)
                </label>
              </span>
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

const arkivNr = { field: "ArkivNr", header: "Arkivnr" };
const kolTittel1 = { field: "Tittel1", header: "Tittel" };
const kolTittel2 = { field: "Tittel2", header: "Tittel 2" };
const kolSolo = { field: "SoloInstrument", header: "Solo-instr" };
const kolDurata = { field: "Durata", header: "Durata" };
const kolKategori1 = { field: "Kategori1", header: "Kategori" };
const kolKategori2 = { field: "Kategori2", header: "Kategori 2" };
const kolKategori3 = { field: "Kategori3", header: "Kategori 3" };
const kolKommentar = { field: "Kommentar", header: "Kommentar" };
const kolKomponist = { field: "Komponist", header: "Komponist" };
const kolLand = { field: "Land", header: "Land" };
const kolArrangor = { field: "Arrangor", header: "Arrangør" };
const kolArrangertFor1 = { field: "ArrangertFor1", header: "Arrangert for" };
const kolArrangertFor2 = { field: "ArrangertFor2", header: "Arrangert for 2" };

const allCols = [
  arkivNr,
  kolTittel1,
  kolTittel2,
  kolSolo,
  kolDurata,
  kolKategori1,
  kolKategori2,
  kolKategori3,
  kolKommentar,
  kolKomponist,
  kolLand,
  kolArrangor,
  kolArrangertFor1,
  kolArrangertFor2
];
const minCols = [
  arkivNr,
  kolTittel1,
  kolKategori1,
  kolKomponist,
  kolArrangor,
  kolKommentar
];

export default {
  name: "Noter",
  data() {
    return {
      passord: null,
      passordFeil: false,
      title: process.env.VUE_APP_TITLE,
      columnOptions: null,
      allColumns: allCols,
      showAllCols: false,
      filters: {},
      loading: true,
      noter: [],
      kanLese: false,
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
  },
  methods: {
    settRolle() {
      if (this.passord === "tonekunst") {
        this.kanLese = true;
      } else if (this.passord === "ravikra") {
        this.kanLese = true;
        this.kanSkrive = true;
      } else {
        this.passordFeil = true;
      }
    },
    exportCSV() {
      this.$refs.dt.exportCSV();
    },
    onRowSelect(event) {
      this.arkNrNaa = event.data.ArkivNr;
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
        ArkivNr: this.arkNrNaa
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
        n => n.ArkivNr === this.arkNrNaa
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
      let currentMax = Math.max(...this.noter.map(n => n.ArkivNr));
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

*:not(.fa) {
  font-family: Tahoma, Verdana, Arial, "Avenir", Helvetica, sans-serif;
}
</style>
