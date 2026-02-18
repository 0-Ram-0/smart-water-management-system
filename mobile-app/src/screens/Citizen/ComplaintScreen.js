import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import api from '../../config/api';

const ComplaintScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'water_leak',
    'low_pressure',
    'no_water',
    'water_quality',
    'billing_issue',
    'other'
  ];

  const handleSubmit = async () => {
    if (!formData.category || !formData.title || !formData.description || !formData.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      Alert.alert('Success', 'Complaint submitted successfully', [
        {text: 'OK', onPress: () => navigation.goBack()}
      ]);
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REGISTER COMPLAINT</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>CATEGORY *</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  formData.category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setFormData({...formData, category: cat})}>
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === cat && styles.categoryButtonTextActive
                  ]}>
                  {cat.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>TITLE *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={text => setFormData({...formData, title: text})}
            placeholder="Brief description of the issue"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DESCRIPTION *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={text => setFormData({...formData, description: text})}
            placeholder="Detailed description of the problem"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>LOCATION *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={text => setFormData({...formData, location: text})}
            placeholder="Address or landmark"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT COMPLAINT</Text>
          )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5
  },
  content: {
    padding: 16
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryButton: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    minWidth: 100
  },
  categoryButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc'
  },
  categoryButtonText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500'
  },
  categoryButtonTextActive: {
    color: 'white'
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5
  }
});

export default ComplaintScreen;
