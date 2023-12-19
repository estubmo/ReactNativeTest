import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAlbumsQuery, type AlbumsPage } from "./types/graphql";

const LIMIT = 10;
const DEFAULT_PAGE = 1;

const client = new ApolloClient({
  uri: "https://graphqlzero.almansi.me/api",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          albums: {
            keyArgs: false,
            merge(existing = [], incoming: AlbumsPage) {
              return {
                ...incoming,
                data: [...(existing?.data ?? []), ...(incoming?.data ?? [])],
              };
            },
          },
        },
      },
    },
  }),
});

const AlbumItem = ({ album }) => {
  return (
    <View style={styles.item}>
      <Image
        source={{ uri: album.photos.data[0].thumbnailUrl }}
        style={styles.photo}
      />
      <Text style={styles.title}>{album.title}</Text>
    </View>
  );
};

const AlbumsComponent = () => {
  const [refetching, setRefetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { data, refetch, loading, fetchMore } = useAlbumsQuery({
    variables: {
      options: {
        paginate: {
          limit: LIMIT,
          page: DEFAULT_PAGE,
        },
      },
    },
  });

  const handleRefetch = async () => {
    setRefetching(true);

    setHasMore(!!data?.albums?.links?.next);
    await refetch({
      options: {
        paginate: {
          limit: LIMIT,
          page: DEFAULT_PAGE,
        },
      },
    });
    setRefetching(false);
  };

  const handleLoadMore = async () => {
    if (loading) return;
    setHasMore(true);

    if (!data?.albums?.links?.next) {
      setHasMore(false);
      return;
    }

    await fetchMore({
      variables: {
        options: {
          paginate: {
            limit: data?.albums.links?.next?.limit || LIMIT,
            page: data?.albums.links?.next?.page || DEFAULT_PAGE + 1,
          },
        },
      },
    });
  };
  console.log("🚀 ~ file: App.tsx:115 ~ AlbumsComponent ~ hasMore:", hasMore);

  return (
    <FlatList
      data={data?.albums?.data}
      style={styles.list}
      renderItem={({ item }) => <AlbumItem key={item.id} album={item} />}
      keyExtractor={(item) => item.id}
      onRefresh={handleRefetch}
      refreshing={refetching}
      getItemLayout={(_, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
      onEndReached={handleLoadMore}
      ListFooterComponent={() => (
        <View style={{ height: 80 }}>
          {!loading && (
            <Text>{hasMore ? "Load more..." : "You reached the end"}</Text>
          )}
        </View>
      )}
    />
  );
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <SafeAreaView style={styles.container}>
        <AlbumsComponent />
      </SafeAreaView>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 16,
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    flexShrink: 0,
  },
  list: {
    width: "100%",
    flexGrow: 0,
  },
  item: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
    gap: 16,
    alignSelf: "stretch",
  },
  title: {
    textTransform: "capitalize",
  },
  photo: {
    borderRadius: 8,
    width: 60,
    height: 60,
  },
});
