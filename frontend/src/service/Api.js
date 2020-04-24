import axios from "axios";

export default () => {
  const apiUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://tjk.no/noter";

  return axios.create({
    baseURL: apiUrl,
    withCredentials: true
  });
};
