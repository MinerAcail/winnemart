import { ApolloClient, InMemoryCache } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const link = createUploadLink({
  uri: "http://localhost:4001/query",
  // uri: "http://16.16.208.207:4001/query",

  // credentials: "include",
});

const Client = new ApolloClient({
  cache: new InMemoryCache(),
  link, 
});

export default Client;  




