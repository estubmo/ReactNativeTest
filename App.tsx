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
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, refetch, fetchMore } = useAlbumsQuery({
    variables: {
      options: {
        paginate: {
          limit,
          page,
        },
      },
    },
  });

  const handleRefetch = async () => {
    setRefetching(true);
    await refetch({
      options: {
        paginate: {
          limit: 10,
          page: 1,
        },
      },
    });
    setRefetching(false);
  };

  const handleLoadMore = async () => {
    if (!data?.albums?.links?.next?.page) return;
    await fetchMore({
      variables: {
        options: {
          paginate: {
            limit: data?.albums.links?.next?.limit || 10,
            page: data?.albums.links?.next?.page || 2,
          },
        },
      },
    });
  };


  return (
    <View style={styles.list}>
      <FlatList
        data={data?.albums?.data}
        renderItem={({ item }) => <AlbumItem key={item.id} album={item} />}
        keyExtractor={(item) => item.id}
        onRefresh={handleRefetch}
        refreshing={refetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          <View>
            <Text>Footer</Text>
          </View>
        )}
      />
    </View>
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
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    flexShrink: 0,
    paddingVertical: 80,
    paddingHorizontal: 16,
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
