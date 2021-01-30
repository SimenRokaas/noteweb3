import Api from "@/service/Api";

export default class NoteService {
  static fetchNoter() {
    return Api()
      .get("/arkiv/list")
      .then((res) => res.data);
  }

  static update(note) {
    return Api()
      .put("/arkiv/" + note.ArkivNr, note)
      .then((res) => res);
  }

  static create(note) {
    return Api()
      .post("/arkiv", note)
      .then((res) => res);
  }

  static delete(note) {
    return Api()
      .delete("/arkiv/" + note.ArkivNr)
      .then((res) => res);
  }

  static getSkanListe(arkivnr) {
    return Api()
      .get("/arkiv/skanliste/" + arkivnr)
      .then((res) => res.data);
  }

  static getNote(linkObj) {
    return Api()
      .post("/arkiv/skannetnote/", linkObj, {
        responseType: "blob",
      })
      .then((res) => res);
  }
}
