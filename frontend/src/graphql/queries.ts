import { gql } from "@apollo/client";

export const GET_RISKS = gql`
  query GetRisks(
    $page: Int!
    $limit: Int!
    $showResolved: Boolean!
    $search: String
  ) {
    risks(
      page: $page
      limit: $limit
      showResolved: $showResolved
      search: $search
    ) {
      edges {
        id
        name
        description
        status
        createdBy
        createdAt
        category {
          id
          name
        }
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const CREATE_RISK = gql`
  mutation CreateRisk($input: CreateRiskInput!) {
    createRisk(input: $input) {
      id
      name
      description
      status
      createdBy
      createdAt
      category {
        id
        name
      }
    }
  }
`;

export const UPDATE_RISK = gql`
  mutation UpdateRisk($id: ID!, $input: UpdateRiskInput!) {
    updateRisk(id: $id, input: $input) {
      id
      name
      description
      status
      createdBy
      createdAt
      category {
        id
        name
      }
    }
  }
`;

export const DELETE_RISK = gql`
  mutation DeleteRisk($id: ID!) {
    deleteRisk(id: $id)
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories($page: Int!, $limit: Int!, $search: String) {
    categories(page: $page, limit: $limit, search: $search) {
      edges {
        id
        name
        description
        createdBy
        createdAt
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      createdBy
      createdAt
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      description
      createdBy
      createdAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
