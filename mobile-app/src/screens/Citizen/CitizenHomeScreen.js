import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import useAuthStore from '../../store/authStore';
import api from '../../config/api';

const CitizenHomeScreen = ({navigation}) => {
  const {user, logout} = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/citizen/dashboard');
      setDashboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CITIZEN PORTAL</Text>
        <Text style={styles.subtitle}>
          USER: {user?.fullName?.toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        {dashboard && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dashboard.complaints.open}</Text>
              <Text style={styles.statLabel}>OPEN COMPLAINTS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dashboard.bills.pending}</Text>
              <Text style={styles.statLabel}>PENDING BILLS</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Complaint')}>
          <Text style={styles.primaryButtonText}>REGISTER COMPLAINT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Billing')}>
          <Text style={styles.primaryButtonText}>VIEW BILLS & PAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('WaterSupply')}>
          <Text style={styles.secondaryButtonText}>WATER SUPPLY SCHEDULE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 50
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'monospace'
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    letterSpacing: 0.5
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  secondaryButton: {
    backgroundColor: '#00a86b',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 'auto'
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5
  }
});

export default CitizenHomeScreen;
