<template>
  <div>
    <Dialog
      :visible="!kanLese && !kanSkrive"
      :style="{ width: '600px' }"
      header="Logg inn"
      :modal="true"
    >
      <div class="p-fluid" style="margin-bottom: 5px">
        Du må logge på notearkivet separat. Oppgi passord nedenfor.
      </div>

      <div class="p-fluid">
        <div style="margin-bottom: 5px">
          <Password
            v-model="passord"
            autofocus
            :feedback="false"
            @keyup.enter.native="settRolle"
          />
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

    <table v-if="kanLese || kanSkrive">
      <tr>
        <td style="vertical-align: top">
          <!--suppress HtmlUnknownTarget -->
          <img
            src="Tønsberg-Janitsjarkorps-logo-600px-300x300.jpg"
            alt="TJK logo"
            width="50"
          />
        </td>
        <td style="vertical-align: middle">
          <span style="font-size: 18px; font-weight: bold">{{ tittel }}</span>
        </td>
        <td style="vertical-align: middle">
          <span style="font-size: 12px">v2020.12.13</span>
        </td>
      </tr>
    </table>

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
      :auto-layout="!justerbareKolonner"
      class="p-datatable-striped"
      csv-separator="|"
      current-page-report-template="Viser {first} til {last} av {totalRecords} noter"
      dataKey="ArkivNr"
      export-filename="noter"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      ref="dt"
      id="notetabell"
      selection-mode="single"
      sort-field="kolArkivNr"
      v-if="kanLese || kanSkrive"
    >
      <template #header>
        <table>
          <tr>
            <td style="float: left">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <InputText
                  v-model="filters['global']"
                  placeholder="Fritekst søk"
                  size="40"
                  @keyup="highlightMatches($event)"
                />
              </span>
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
              <Checkbox
                id="justerbareKolonner"
                v-model="justerbareKolonner"
                :binary="true"
              />
              <label
                for="justerbareKolonner"
                class="p-checkbox-label"
                style="font-size: 14px; margin-right: 4px"
              >
                Justerbare kolonnebredder
              </label>
              <Button
                icon="pi pi-cog"
                label="Velg kolonner"
                @click="visKolonneValgDialog = true"
                style="margin-right: 4px"
                class="p-button-help"
              />
              <Button
                icon="pi pi-plus"
                label="Legg til"
                @click="leggTilNote"
                style="margin-right: 4px"
                v-show="kanSkrive"
                class="p-button-success"
              />
              <SplitButton
                label="Eksport"
                icon="pi pi-external-link"
                :model="eksportValg"
                style="margin-right: 4px"
              >
              </SplitButton>
              <Button
                icon="pi pi-sign-out"
                label="Logg ut"
                @click="loggUt"
                class="p-button-warning"
              ></Button>
            </td>
          </tr>
        </table>
      </template>
      <template #empty> Ingen treff. </template>
      <template #loading> Laster noter, vent litt... </template>

      <Column
        v-for="col of valgteKolonner"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="true"
      />
    </DataTable>

    <KolonnePicklist
      :erSynlig="visKolonneValgDialog"
      :alleKolonner="allColumns"
      :initieltValgteKolonner="valgteKolonner"
      @skjul-kolonnevalg="skjulKolonneValgDialog"
      @valgte-kolonner="oppdaterValgteKolonner"
    />

    <NoteDialog
      :erSynlig="visDialog"
      :mode="mode"
      :dialogNote="dialogNote"
      :arkNrNaa="arkNrNaa"
      :noter="noter"
      :valgtNote="valgtNote"
      :kanSkrive="kanSkrive"
      :allColumns="allColumns"
      :visAvbrytKnapp="visAvbrytKnapp"
      :visSlettKnapp="visSlettKnapp"
      @skjul-notedialog="skjulNoteDialog"
    />
  </div>
</template>

<script>
import NoteService from "@/service/NoteService";
import KolonnePicklist from "@/components/noter/KolonnePicklist";
import NoteDialog from "@/components/noter/NoteDialog";
import XLSX from "xlsx";

const kolArkivNr = { field: "ArkivNr", header: "Arkivnr" };
const kolTittel1 = { field: "Tittel1", header: "Tittel" };
const kolTittel2 = { field: "Tittel2", header: "Tittel 2" };
const kolSolo = { field: "Soloinstrument", header: "Solo-instr" };
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
  kolArkivNr,
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
  kolArrangertFor2,
];
const minCols = [
  kolArkivNr,
  kolTittel1,
  kolKategori1,
  kolKomponist,
  kolArrangor,
  kolKommentar,
];

export default {
  name: "Noter",
  data() {
    return {
      allColumns: allCols,
      arkNrNaa: null,
      dialogNote: {},
      eksportValg: [
        {
          label: "Alle > Excel",
          title: "Eksporter alle noter til Excel-fil (faste kolonner)",
          icon: "pi pi-file-excel",
          command: () => {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(this.noter);
            ws["!cols"] = [
              { wch: 6 }, // arkivNr
              { wch: 20 }, // tittel1
              { wch: 15 }, // tittel2
              { wch: 10 }, // soloinstr
              { wch: 8 }, // durata
              { wch: 20 }, // kat1
              { wch: 20 }, // kat2
              { wch: 10 }, // kat3
              { wch: 30 }, // kommentar
              { wch: 20 }, // komponist
              { wch: 8 }, // land
              { wch: 20 }, // arrangor
              { wch: 10 }, // arrangortFor1
              { wch: 10 }, // arrangortFor2
            ];
            XLSX.utils.book_append_sheet(wb, ws, "TJK-notearkiv-alle");
            XLSX.writeFile(wb, "TJK-notearkiv-alle.xlsx");
          },
        },
        {
          label: "Skjerm > Excel",
          title: "Eksporter vist tabell til Excel-fil",
          icon: "pi pi-file-excel",
          command: () => {
            const elt = document.getElementById("notetabell");
            const wb = XLSX.utils.table_to_book(elt, {
              sheet: "TJK-notearkiv-utsnitt",
            });
            XLSX.writeFile(wb, "TJK-notearkiv-utsnitt.xlsx");
          },
        },
        {
          label: "Skjerm > CSV",
          title: "Eksporter vist tabell til csv-fil, feltskille '|'",
          icon: "pi pi-file",
          command: () => {
            this.$refs.dt.exportCSV();
          },
        },
      ],
      erDev: process.env.NODE_ENV === "development",
      filters: {},
      justerbareKolonner: false,
      valgteKolonner: minCols,
      kanLese: false,
      kanSkrive: false,
      loading: true,
      mode: "VIS",
      noter: [],
      passord: null,
      passordFeil: false,
      tittel: process.env.VUE_APP_TITLE,
      valgtNote: null,
      visAvbrytKnapp: false,
      visDialog: false,
      visKolonneValgDialog: false,
      visSlettKnapp: true,
    };
  },
  components: {
    KolonnePicklist,
    NoteDialog,
  },
  mounted() {
    this.title = process.env.VUE_APP_TITLE;
    NoteService.fetchNoter().then((data) => {
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
    onRowSelect(event) {
      this.arkNrNaa = event.data.ArkivNr;
      this.mode = "ENDRE";
      this.dialogNote = { ...event.data };
      this.visSlettKnapp = true;
      this.visAvbrytKnapp = true;
      this.visDialog = true;
    },
    highlightMatches() {
      const searchWords = this.filters["global"].split(" ");
      const tabellen = document.querySelector(".p-datatable-tbody");
      const tds = tabellen.getElementsByTagName("TD");
      tds.forEach((td) => {
        td.innerHTML = td.innerHTML.replace(/<mark>(.*)<\/mark>/, "$1");
        searchWords.forEach((word) => {
          if (
            word.length > 0 &&
            td.textContent.toLowerCase().indexOf(word.toLowerCase()) !== -1
          ) {
            const wordEscaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            td.innerHTML = td.innerHTML.replace(
              new RegExp(wordEscaped, "i"),
              "<mark>$&</mark>"
            );
          }
        });
      });
    },
    leggTilNote() {
      this.mode = "NY";
      this.arkNrNaa = this.genererArkivnr();
      this.dialogNote = {
        ArkivNr: this.arkNrNaa,
      };
      this.visSlettKnapp = false;
      this.visAvbrytKnapp = true;
      this.visDialog = true;
    },
    genererArkivnr() {
      let currentMax = Math.max(...this.noter.map((n) => n.ArkivNr));
      return currentMax + 1;
    },
    skjulNoteDialog() {
      this.visDialog = false;
      this.dialogNote = null;
    },
    skjulKolonneValgDialog() {
      this.visKolonneValgDialog = false;
    },
    oppdaterValgteKolonner(kol) {
      this.valgteKolonner = kol;
    },
    loggUt() {
      if (this.kanSkrive) {
        this.kanSkrive = false;
      }
      if (this.kanLese) {
        this.kanLese = false;
      }
    },
  },
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
</style>
