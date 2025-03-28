import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query getAllProducts ($query: String){
    getAllProducts(query: $query) {
      id
      name
      price
      state
      categories
      imageUrls
    }
  }
`;