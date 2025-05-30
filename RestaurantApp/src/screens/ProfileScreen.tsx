import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { Reservation, UpdateReservationRequest, RootStackParamList } from '../types';
import ApiService from '../services/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [editData, setEditData] = useState({
    date: '',
    time: '',
    people_count: '',
    special_requests: '',
  });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getUserReservations();
      if (response.success) {
        setReservations(response.data.reservations);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReservations();
  }, []);

  const handleLogout = async () => {
    console.log('🔴 Logout button pressed - direct logout');
    try {
      setLogoutLoading(true);
      console.log('🔄 Calling logout function...');
      await logout();
      console.log('✅ Logout function completed successfully');
      // Navigation will be handled automatically by the authentication state change in App.tsx
    } catch (error) {
      console.error('❌ Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLogoutLoading(false);
      console.log('✅ Logout loading state reset');
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setEditData({
      date: reservation.date,
      time: reservation.time,
      people_count: reservation.people_count.toString(),
      special_requests: reservation.special_requests || '',
    });
  };

  const handleUpdateReservation = async () => {
    if (!editingReservation) return;

    if (!editData.date || !editData.time) {
      Alert.alert('Error', 'Please enter date and time');
      return;
    }

    const peopleCount = parseInt(editData.people_count);
    if (isNaN(peopleCount) || peopleCount < 1 || peopleCount > 20) {
      Alert.alert('Error', 'Please enter a valid number of people (1-20)');
      return;
    }

    // Close modal and navigate to main page immediately
    setEditingReservation(null);
    navigation.navigate('Main');

    setLoading(true);
    try {
      const updateRequest: UpdateReservationRequest = {
        date: editData.date,
        time: editData.time,
        people_count: peopleCount,
        special_requests: editData.special_requests || undefined,
      };

      const response = await ApiService.updateReservation(editingReservation.id, updateRequest);
      
      if (response.success) {
        Alert.alert('Success', 'Reservation updated successfully');
        loadReservations();
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      console.error('Update reservation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = (reservation: Reservation) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your reservation at ${reservation.restaurant_name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelReservation(reservation.id),
        },
      ]
    );
  };

  const cancelReservation = async (reservationId: number) => {
    setLoading(true);
    try {
      const response = await ApiService.cancelReservation(reservationId);
      if (response.success) {
        Alert.alert('Success', 'Reservation cancelled successfully');
        loadReservations();
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      console.error('Cancel reservation error:', error);
      Alert.alert('Error', 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      case 'completed':
        return '#7f8c8d';
      default:
        return '#3498db';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderReservation = (reservation: Reservation) => (
    <View key={reservation.id} style={styles.reservationCard}>
      <View style={styles.reservationHeader}>
        <Text style={styles.restaurantName}>{reservation.restaurant_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
          <Text style={styles.statusText}>{reservation.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.reservationLocation}>{reservation.restaurant_location}</Text>
      
      <View style={styles.reservationDetails}>
        <Text style={styles.detailText}>📅 {formatDate(reservation.date)}</Text>
        <Text style={styles.detailText}>🕐 {reservation.time}</Text>
        <Text style={styles.detailText}>👥 {reservation.people_count} people</Text>
      </View>

      {reservation.special_requests && (
        <Text style={styles.specialRequests}>
          Note: {reservation.special_requests}
        </Text>
      )}

      {reservation.status === 'confirmed' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditReservation(reservation)}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelReservation(reservation)}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]} 
            onPress={handleLogout} 
            activeOpacity={0.7}
            disabled={logoutLoading}
          >
            <Text style={styles.logoutButtonText}>
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reservationsSection}>
          <Text style={styles.sectionTitle}>My Reservations</Text>
          {reservations.length > 0 ? (
            reservations.map(renderReservation)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reservations yet</Text>
              <Text style={styles.emptySubtext}>
                Browse restaurants and make your first reservation!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Reservation Modal */}
      <Modal
        visible={!!editingReservation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingReservation(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setEditingReservation(null)}
              style={styles.cancelModalButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Reservation</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.editRestaurantName}>
              {editingReservation?.restaurant_name}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={editData.date}
                onChangeText={(text) => setEditData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={editData.time}
                onChangeText={(text) => setEditData(prev => ({ ...prev, time: text }))}
                placeholder="HH:MM"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of People</Text>
              <TextInput
                style={styles.input}
                value={editData.people_count}
                onChangeText={(text) => setEditData(prev => ({ ...prev, people_count: text }))}
                placeholder="2"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Special Requests</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.special_requests}
                onChangeText={(text) => setEditData(prev => ({ ...prev, special_requests: text }))}
                placeholder="Any special requests..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.updateButton, loading && styles.buttonDisabled]}
              onPress={handleUpdateReservation}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Updating...' : 'Update Reservation'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  reservationsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reservationLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  reservationDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  specialRequests: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelModalButton: {
    padding: 5,
  },
  cancelModalText: {
    color: '#3498db',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editRestaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 