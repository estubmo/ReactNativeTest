import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAlbumsQuery } from "./types/graphql";

const client = new ApolloClient({
  uri: "https://graphqlzero.almansi.me/api",
  cache: new InMemoryCache(),
});

const AlbumItem = ({ album }) => {
  return (
    <View>
      <Image
        source={{ uri: album.photos.data[0].thumbnailUrl }}
        style={styles.photo}
      />
      <Text>{album.title}</Text>
    </View>
  );
};

const AlbumsComponent = () => {
  const { data } = useAlbumsQuery({
    variables: {
      options: {
        paginate: {
          limit: 1,
        },
      },
    },
  });

  return (
    <View>
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
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  photo: {
    width: 60,
    height: 60,
  },
});
