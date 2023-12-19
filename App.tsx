import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAlbumsQuery } from "./types/graphql";

const client = new ApolloClient({
  uri: "https://graphqlzero.almansi.me/api",
  cache: new InMemoryCache(),
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
  const { data } = useAlbumsQuery({
    variables: {
      options: {
        paginate: {
          limit: 10,
        },
      },
    },
  });

  return (
    <View style={styles.list}>
      {data?.albums?.data?.map((album) => (
        <AlbumItem key={album.id} album={album} />
      ))}
    </View>
  );
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <View style={styles.container}>
        <AlbumsComponent />
      </View>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#f0f",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
    flexShrink: 0,
    backgroundColor: "#ff0",
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  item: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#0ff",
    alignSelf: "stretch",
  },
  title:{
    textTransform: "capitalize"
  },
  photo: {
    borderRadius: 8,
    width: 60,
    height: 60,
  },
});
