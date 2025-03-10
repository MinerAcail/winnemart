import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
const API_URL =
  window.location.hostname === "localhost"
    ? "http://16.16.208.207:4001/query"
    : `https://${window.location.hostname}/query`; // Changed HTTPS to HTTP

const link = createUploadLink({
  uri: API_URL,
  credentials: "include",
});

// console.log("API_URL",  window.location.hostname);
// .console(API_URL);
const Client = new ApolloClient({
  cache: new InMemoryCache(),
  link, 
});

export default Client;  




