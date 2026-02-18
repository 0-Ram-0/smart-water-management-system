import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import api from '../../config/api';

const BillingScreen = ({navigation}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/billing/bills');
      setBills(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePayment = async (bill) => {
    Alert.alert(
      'Confirm Payment',
      `Pay ₹${bill.totalAmount.toFixed(2)} for bill ${bill.billNumber}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Pay',
          onPress: async () => {
            setPaying(bill.id);
            try {
              await api.post('/billing/pay', {
                billId: bill.id,
                amount: bill.totalAmount
              });
              Alert.alert('Success', 'Payment processed successfully');
              fetchBills();
            } catch (error) {
              console.error('Payment error:', error);
              Alert.alert('Error', 'Payment failed. Please try again.');
            } finally {
              setPaying(null);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#00a86b';
      case 'overdue': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const renderBill = ({item}) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <View>
          <Text style={styles.billNumber}>{item.billNumber}</Text>
          <Text style={styles.billingPeriod}>
            {item.billingPeriod || 'N/A'}
          </Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.billDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Units:</Text>
          <Text style={styles.detailValue}>{item.unitsConsumed || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
        </View>
        {item.dueDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.dueDate).toLocaleDateString('en-IN')}
            </Text>
          </View>
        )}
      </View>

      {item.status !== 'paid' && (
        <TouchableOpacity
          style={[styles.payButton, paying === item.id && styles.payButtonDisabled]}
          onPress={() => handlePayment(item)}
          disabled={paying === item.id}>
          {paying === item.id ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>PAY NOW</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WATER BILLS</Text>
        <Text style={styles.headerSubtitle}>
          {bills.length} bill{bills.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={bills}
        renderItem={renderBill}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchBills} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bills found</Text>
          </View>
        }
      />
    </View>
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
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9
  },
  listContent: {
    padding: 16
  },
  billCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  billNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  billingPeriod: {
    fontSize: 12,
    color: '#666'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  billDetails: {
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  detailLabel: {
    fontSize: 13,
    color: '#666'
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333'
  },
  payButton: {
    backgroundColor: '#00a86b',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center'
  },
  payButtonDisabled: {
    opacity: 0.6
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  }
});

export default BillingScreen;
