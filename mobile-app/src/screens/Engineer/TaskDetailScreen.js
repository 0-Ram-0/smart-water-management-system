import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import api from '../../config/api';

const TaskDetailScreen = ({route, navigation}) => {
  const {taskId} = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      Alert.alert('Error', 'Failed to load task details');
      setLoading(false);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/tasks/${taskId}`, {status: newStatus});
      await fetchTask();
      Alert.alert('Success', `Task status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = (status) => {
    Alert.alert(
      'Update Status',
      `Change task status to ${status.replace('_', ' ')}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: () => updateTaskStatus(status)}
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TASK DETAILS</Text>
        <Text style={styles.taskCode}>{task.taskCode}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TITLE</Text>
          <Text style={styles.sectionContent}>{task.title}</Text>
        </View>

        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
            <Text style={styles.sectionContent}>{task.description}</Text>
          </View>
        )}

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>TYPE</Text>
            <Text style={styles.infoValue}>{task.type.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>PRIORITY</Text>
            <Text style={styles.infoValue}>{task.priority.toUpperCase()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <Text style={styles.infoValue}>{task.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        {task.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LOCATION</Text>
            <Text style={styles.sectionContent}>{task.location}</Text>
            {task.latitude && task.longitude && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate('TaskMap', {task})}>
                <Text style={styles.mapButtonText}>VIEW ON MAP</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {task.dueDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DUE DATE</Text>
            <Text style={styles.sectionContent}>
              {new Date(task.dueDate).toLocaleString('en-IN')}
            </Text>
          </View>
        )}

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>UPDATE STATUS</Text>
          <View style={styles.actionButtons}>
            {task.status !== 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleStatusUpdate('in_progress')}
                disabled={updating}>
                <Text style={styles.actionButtonText}>START WORK</Text>
              </TouchableOpacity>
            )}
            {task.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSuccess]}
                onPress={() => handleStatusUpdate('completed')}
                disabled={updating}>
                <Text style={styles.actionButtonText}>MARK COMPLETE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 50
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  taskCode: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'monospace'
  },
  content: {
    padding: 16
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  sectionContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12
  },
  infoItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '30%'
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  mapButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0066cc',
    borderRadius: 4,
    alignItems: 'center'
  },
  mapButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  actionSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 12
  },
  actionButtons: {
    marginTop: 12
  },
  actionButton: {
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8
  },
  actionButtonPrimary: {
    backgroundColor: '#0066cc'
  },
  actionButtonSuccess: {
    backgroundColor: '#00a86b'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c'
  }
});

export default TaskDetailScreen;
