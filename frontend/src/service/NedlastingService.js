import Api from "@/service/Api";

export default class NedlastingService {
  static parseLog() {
    return Api()
      .get("/nedlastinger/parselog")
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }
}
