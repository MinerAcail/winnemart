import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
// import { Production } from "../../v";
const Production = false;
// const Production = true;
const API_URL = Production ? "https://api.winnemart.com/query" : "http://localhost:4001/query";
const link = createUploadLink({
  uri: API_URL,
  // uri: "http://localhost:4001/query",
  credentials: "include",
});
// "http://16.16.208.207:4001/query"

// console.log("API_URL",  window.location.hostname);
// .console(API_URL);
const Client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default Client;
