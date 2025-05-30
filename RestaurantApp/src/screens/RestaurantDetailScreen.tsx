import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, CreateReservationRequest } from '../types';
import ApiService from '../services/api';

type Props = StackScreenProps<RootStackParamList, 'RestaurantDetail'>;

export const RestaurantDetailScreen = ({ route, navigation }: Props) => {
  const { restaurant } = route.params;
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    date: '',
    time: '',
    people_count: '2',
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);

  const handleMakeReservation = async () => {
    // Close the modal and navigate back to the restaurant list
    setShowReservationModal(false);
    navigation.navigate('Main');
  };

  const renderStars = (rating: number) => {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }

    return stars.join('');
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Ensure rating is a valid number, default to 0 if not
  const safeRating = typeof restaurant.rating === 'number' && !isNaN(restaurant.rating) ? restaurant.rating : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: restaurant.image_url }} style={styles.image} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.stars}>{renderStars(safeRating)}</Text>
              <Text style={styles.rating}>{safeRating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.location}>{restaurant.location}</Text>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{restaurant.price_range}</Text>
            </View>
            <View style={[styles.tag, styles.cuisineTag]}>
              <Text style={[styles.tagText, styles.cuisineTagText]}>
                {restaurant.cuisine_type}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>

          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => setShowReservationModal(true)}
          >
            <Text style={styles.reserveButtonText}>Make Reservation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reservation Modal */}
      <Modal
        visible={showReservationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReservationModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowReservationModal(false)}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Make Reservation</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.restaurantNameModal}>{restaurant.name}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={reservationData.date}
                onChangeText={(text) =>
                  setReservationData(prev => ({ ...prev, date: text }))
                }
                placeholder={`YYYY-MM-DD (e.g., ${getTodayDate()})`}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={reservationData.time}
                onChangeText={(text) =>
                  setReservationData(prev => ({ ...prev, time: text }))
                }
                placeholder="HH:MM (e.g., 19:30)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of People</Text>
              <TextInput
                style={styles.input}
                value={reservationData.people_count}
                onChangeText={(text) =>
                  setReservationData(prev => ({ ...prev, people_count: text }))
                }
                placeholder="2"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Special Requests (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reservationData.special_requests}
                onChangeText={(text) =>
                  setReservationData(prev => ({ ...prev, special_requests: text }))
                }
                placeholder="Any special requests or dietary requirements..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Move button outside ScrollView to prevent touch conflicts */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleMakeReservation}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Creating Reservation...' : 'Confirm Reservation'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  stars: {
    fontSize: 16,
    color: '#f39c12',
    marginBottom: 2,
  },
  rating: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  location: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  cuisineTag: {
    backgroundColor: '#e3f2fd',
  },
  tagText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cuisineTagText: {
    color: '#3498db',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  reserveButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  cancelButton: {
    padding: 5,
  },
  cancelText: {
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
  restaurantNameModal: {
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
  confirmButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
}); 