import { gql } from "@apollo/client";

const albumFragment = gql`
  fragment Album on Album {
    id
    title
    photos {
      data {
        id
        title
        url
        thumbnailUrl
      }
    }
  }
`;

const pageLimitPairFragment = gql`
  fragment PageLimitPair on PageLimitPair {
    page
    limit
  }
`;

const linkFragments = gql`
  ${pageLimitPairFragment}
  fragment PaginationLinks on PaginationLinks {
    first {
      ...PageLimitPair
    }
    prev {
      ...PageLimitPair
    }
    next {
      ...PageLimitPair
    }
    last {
      ...PageLimitPair
    }
  }
`;

gql`
  ${linkFragments}
  ${albumFragment}
  query Albums($options: PageQueryOptions) {
    albums(options: $options) {
      data {
        ...Album
      }
      links {
        ...PaginationLinks
      }
      meta {
        totalCount
      }
    }
  }
`;

gql`
  ${albumFragment}
  query Album($id: ID!) {
    album(id: $id) {
      ...Album
    }
  }
`;
