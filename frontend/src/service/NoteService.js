//import axios from 'axios'

export default class NoteService {
  static fetchNoter() {
    // return axios.get('noter/list').then(res => res.data.data);
    return [
      { tittel: "Volkswagen", year: 2012, color: "Orange", id: "dsad231ff" },
      { tittel: "Audi", year: 2011, color: "Black", id: "gwregre345" },
      { tittel: "Renault", year: 2005, color: "Gray", id: "h354htr" },
      { tittel: "BMW", year: 2003, color: "Blue", id: "j6w54qgh" },
      { tittel: "Mercedes", year: 1995, color: "Orange", id: "hrtwy34" },
      { tittel: "Volvo", year: 2005, color: "Black", id: "jejtyj" },
      { tittel: "Honda", year: 2012, color: "Yellow", id: "g43gr" },
      { tittel: "Jaguar", year: 2013, color: "Orange", id: "greg34" },
      { tittel: "Ford", year: 2000, color: "Black", id: "h54hw5" },
      { tittel: "Fiat", year: 2013, color: "Red", id: "245t2s" }
    ];
  }
}
