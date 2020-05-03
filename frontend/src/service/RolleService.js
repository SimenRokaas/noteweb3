import Api from "@/service/Api";

export default class RolleService {
  static fetchRolle() {
    return Api()
      .get("rolle/")
      .then(res => res.data.kanSkrive);
  }
}
