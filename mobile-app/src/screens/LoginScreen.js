import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import api from '../config/api';
import useAuthStore from '../store/authStore';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useAuthStore();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      const {token, user} = response.data;
      login(user, token);

      // Navigate based on role
      if (user.role === 'engineer') {
        navigation.replace('EngineerHome');
      } else if (user.role === 'citizen') {
        navigation.replace('CitizenHome');
      } else {
        Alert.alert('Error', 'This app is for engineers and citizens only');
        setLoading(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', errorMessage);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SMART WATER MANAGEMENT</Text>
        <Text style={styles.subtitle}>SOLAPUR MUNICIPAL CORPORATION</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.credentials}>
          <Text style={styles.credentialsTitle}>TEST CREDENTIALS</Text>
          <Text style={styles.credentialsText}>
            ENGINEER: engineer1 / engineer123
          </Text>
          <Text style={styles.credentialsText}>
            CITIZEN: citizen1 / citizen123
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
    fontFamily: 'monospace'
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  },
  credentials: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4
  },
  credentialsTitle: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 0.5
  },
  credentialsText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace'
  }
});

export default LoginScreen;
