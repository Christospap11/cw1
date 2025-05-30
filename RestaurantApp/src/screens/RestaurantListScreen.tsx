import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Restaurant } from '../types';
import ApiService from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type RestaurantListNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: RestaurantListNavigationProp;
}

export const RestaurantListScreen = ({ navigation }: Props) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRestaurants(true);
  }, [searchQuery]);

  const loadRestaurants = async (reset = false) => {
    if (loading && !reset) return;

    setLoading(true);
    const currentPage = reset ? 1 : page;

    try {
      const response = await ApiService.getRestaurants(
        searchQuery || undefined,
        undefined,
        undefined,
        currentPage,
        10
      );

      if (response.success) {
        const newRestaurants = response.data.restaurants;
        
        if (reset) {
          setRestaurants(newRestaurants);
          setPage(1);
        } else {
          setRestaurants(prev => [...prev, ...newRestaurants]);
        }

        setHasMore(currentPage < response.data.pagination.pages);
        setPage(currentPage + 1);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRestaurants(true);
  }, [searchQuery]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadRestaurants();
    }
  };

  const navigateToRestaurant = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const renderStars = (rating: number) => {
    const stars = [];
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

  const renderRestaurant = ({ item }: { item: Restaurant }) => {
    // Ensure rating is a valid number, default to 0 if not
    const safeRating = typeof item.rating === 'number' && !isNaN(item.rating) ? item.rating : 0;
    
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigateToRestaurant(item)}
      >
        <Image source={{ uri: item.image_url }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantLocation}>{item.location}</Text>
          <Text style={styles.restaurantDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.restaurantMeta}>
            <View style={styles.ratingContainer}>
              <Text style={styles.stars}>{renderStars(safeRating)}</Text>
              <Text style={styles.rating}>{safeRating.toFixed(1)}</Text>
            </View>
            <View style={styles.tagContainer}>
              <Text style={styles.priceRange}>{item.price_range}</Text>
              <Text style={styles.cuisine}>{item.cuisine_type}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No restaurants found matching your search' : 'No restaurants available'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || restaurants.length === 0) return null;
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more restaurants...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants or locations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  listContainer: {
    padding: 15,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 16,
    color: '#f39c12',
    marginRight: 5,
  },
  rating: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRange: {
    backgroundColor: '#e8f5e8',
    color: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cuisine: {
    backgroundColor: '#e3f2fd',
    color: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
}); 