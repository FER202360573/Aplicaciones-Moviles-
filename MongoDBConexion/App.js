import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const API_URL = 'http://localhost:4000'; // Cambiar por la IP de tu compu si usas emulador/celular físico

export default function App() {
  // --- Estado de login ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- Estado de películas ---
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  // --- Estado del modal ---
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError('Ingresa usuario y contraseña.');
      return;
    }

    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setIsLoggedIn(true);
        fetchMovies();
      } else {
        setLoginError(data.mensaje || 'No se pudo iniciar sesión.');
      }
    } catch (error) {
      console.log(error);
      setLoginError('No se pudo conectar con el servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchMovies = async () => {
    setLoadingMovies(true);
    try {
      const res = await fetch(`${API_URL}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMovies(false);
    }
  };

  const openMovie = (movie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  };

  const closeMovie = () => {
    setModalVisible(false);
    setSelectedMovie(null);
  };

  // ---------- Pantalla de LOGIN ----------
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Iniciar sesión</Text>
        <Text style={styles.loginSubtitle}>Ingresa tu cuenta de MongoDB Atlas</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loginLoading}>
          {loginLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Conectar</Text>
          )}
        </TouchableOpacity>

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // ---------- Pantalla de LISTA DE PELÍCULAS ----------
  if (loadingMovies) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#07f" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openMovie(item)}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={styles.poster} />
      ) : (
        <View style={styles.noPoster}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.plotPreview} numberOfLines={3}>
          {item.plot || item.fullplot || 'Sin descripción'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={movies}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

      {/* Modal con la ficha extendida de la película seleccionada */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeMovie}
      >
        {selectedMovie && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {selectedMovie.poster ? (
                <Image source={{ uri: selectedMovie.poster }} style={styles.modalPoster} />
              ) : (
                <View style={[styles.noPoster, styles.modalNoPoster]}>
                  <Text>No Image</Text>
                </View>
              )}

              <Text style={styles.modalTitle}>{selectedMovie.title}</Text>

              <Text style={styles.modalMeta}>
                {[selectedMovie.year, selectedMovie.rated, selectedMovie.runtime && `${selectedMovie.runtime} min`]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>

              {selectedMovie.imdb?.rating ? (
                <Text style={styles.modalRating}>⭐ IMDb: {selectedMovie.imdb.rating}</Text>
              ) : null}

              {selectedMovie.genres?.length ? (
                <Text style={styles.modalSectionText}>{selectedMovie.genres.join(', ')}</Text>
              ) : null}

              <Text style={styles.modalSectionTitle}>Sinopsis</Text>
              <Text style={styles.modalSectionText}>
                {selectedMovie.fullplot || selectedMovie.plot || 'Sin descripción disponible.'}
              </Text>

              {selectedMovie.directors?.length ? (
                <>
                  <Text style={styles.modalSectionTitle}>Director(es)</Text>
                  <Text style={styles.modalSectionText}>{selectedMovie.directors.join(', ')}</Text>
                </>
              ) : null}

              {selectedMovie.cast?.length ? (
                <>
                  <Text style={styles.modalSectionTitle}>Reparto</Text>
                  <Text style={styles.modalSectionText}>{selectedMovie.cast.join(', ')}</Text>
                </>
              ) : null}

              {selectedMovie.writers?.length ? (
                <>
                  <Text style={styles.modalSectionTitle}>Guion</Text>
                  <Text style={styles.modalSectionText}>{selectedMovie.writers.join(', ')}</Text>
                </>
              ) : null}

              {selectedMovie.countries?.length ? (
                <>
                  <Text style={styles.modalSectionTitle}>País(es)</Text>
                  <Text style={styles.modalSectionText}>{selectedMovie.countries.join(', ')}</Text>
                </>
              ) : null}

              {selectedMovie.languages?.length ? (
                <>
                  <Text style={styles.modalSectionTitle}>Idioma(s)</Text>
                  <Text style={styles.modalSectionText}>{selectedMovie.languages.join(', ')}</Text>
                </>
              ) : null}

              <TouchableOpacity style={styles.closeButton} onPress={closeMovie}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Login
  loginContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#0077ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },

  // Loader
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Lista
  card: {
    flexDirection: 'row',
    padding: 10,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 10,
  },
  noPoster: {
    width: 80,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  plotPreview: {
    fontSize: 13,
    color: 'gray',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalPoster: {
    width: 180,
    height: 270,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalNoPoster: {
    width: 180,
    height: 270,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalMeta: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  modalRating: {
    fontSize: 14,
    marginBottom: 10,
  },
  modalSectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 4,
  },
  modalSectionText: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#0077ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});