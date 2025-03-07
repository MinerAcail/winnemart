import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
// const API_URL = window.location.hostname === "localhost"
//   ? "http://localhost:4001/query"
//   : `http://${window.location.hostname}:4001/query`;

const link = createUploadLink({
  uri:"http://16.16.208.207:4001/query",
  // uri:"http://localhost:4001/query",

  credentials: "include",
});

const Client = new ApolloClient({
  cache: new InMemoryCache(),
  link, 
});

export default Client;  




