import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query getAllProducts {
    getAllProducts {
      id
      name
      price
      state
      categories
      imageUrls
    }
  }
`;