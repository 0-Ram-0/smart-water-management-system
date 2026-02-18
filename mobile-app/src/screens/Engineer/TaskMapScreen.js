import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import api from '../../config/api';

const TaskMapScreen = ({route}) => {
  const {task} = route.params;
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (task.latitude && task.longitude) {
      fetchNearbySensors();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchNearbySensors = async () => {
    try {
      const response = await api.get('/sensors');
      // Filter sensors near task location (within ~5km)
      const nearby = response.data.filter(s => {
        if (!s.latitude || !s.longitude) return false;
        const distance = calculateDistance(
          task.latitude,
          task.longitude,
          s.latitude,
          s.longitude
        );
        return distance < 5; // 5km radius
      });
      setSensors(nearby);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!task.latitude || !task.longitude) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No location data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: task.latitude,
          longitude: task.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}>
        {/* Task location marker */}
        <Marker
          coordinate={{
            latitude: task.latitude,
            longitude: task.longitude
          }}
          title={task.title}
          description={task.location}
          pinColor="#e74c3c"
        />

        {/* Nearby sensors */}
        {sensors.map(sensor => (
          <Marker
            key={sensor.sensorId}
            coordinate={{
              latitude: sensor.latitude,
              longitude: sensor.longitude
            }}
            title={`Sensor ${sensor.sensorId}`}
            description={sensor.sensorType}
            pinColor={sensor.status === 'active' ? '#0066cc' : '#95a5a6'}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c'
  }
});

export default TaskMapScreen;
