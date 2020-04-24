import Api from "@/service/Api";

export default class NoteService {
  static fetchNoter() {
    return Api()
      .get("noter/list")
      .then(res => res.data.noter);
  }
}
