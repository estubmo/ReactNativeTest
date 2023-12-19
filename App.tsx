import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import {
    Dispatch,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Album, useAlbumsQuery, type AlbumsPage } from "./types/graphql";

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
const ModalContext = createContext<{
  setModalData: Dispatch<SetStateAction<Album | null>>;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
} | null>(null);

const AlbumItem = ({ album }) => {
  const { setModalData, setModalVisible } = useContext(ModalContext);

  return (
    <Pressable
      onPress={() => {
        setModalData(album);
        setModalVisible(true);
      }}
    >
      <View style={styles.item}>
        <Image
          source={{ uri: album.photos.data[0].thumbnailUrl }}
          style={styles.photo}
        />
        <Text style={styles.title}>{album.title}</Text>
      </View>
    </Pressable>
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<Album | null>(null);

  return (
    <ApolloProvider client={client}>
      <ModalContext.Provider value={{ setModalData, setModalVisible }}>
        <SafeAreaView
          style={[
            styles.container,
            modalVisible && styles.containerTransparent
          ]}
        >
          <AlbumsComponent />
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Image
                  source={{ uri: modalData?.photos.data[0].thumbnailUrl }}
                  style={styles.modalPhoto}
                />
                <Text style={styles.modalText}>{modalData?.title}</Text>
                <Pressable
                  style={styles.button}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.textStyle}>Lukk</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ModalContext.Provider>
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
  containerTransparent: {
    backgroundColor: "rgba(0,0,0,0.5)",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flexDirection: "column",
    gap: 24,
    flexShrink: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 190,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#180435",
  },
  textStyle: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  modalPhoto: {
    borderRadius: 16,
    width: 200,
    height: 200,
  },
  modalText: {
    marginBottom: 15,
    fontSize: 36,
    fontWeight: "500",
    textTransform: "capitalize",
    textAlign: "center",
  },
});
