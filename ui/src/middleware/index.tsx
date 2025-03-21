import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
const API_URL =
  window.location.hostname === "localhost"
    ? "https://api.winnemart.com/query"
    : "https://api.winnemart.com/query"; // Changed HTTPS to HTTP

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
