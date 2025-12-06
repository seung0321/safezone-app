// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { searchPlacesByKeyword } from '../api/dataService';
import { SearchedPlace } from '../types/data';

// ... (PlaceItem 컴포넌트는 기존과 동일)
const PlaceItem: React.FC<{ item: SearchedPlace; onPress: () => void }> = ({ item, onPress }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <FontAwesome5 name="map-marker-alt" size={20} color={Colors.accentPrimary} style={styles.itemIcon} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.place_name}</Text>
        <Text style={styles.itemSubtitle}>{item.road_address_name || item.address_name}</Text>
      </View>
    </TouchableOpacity>
  );

const SearchScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { target } = route.params; // 'start' 또는 'end'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length > 1) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    const places = await searchPlacesByKeyword(query);
    setResults(places);
    setIsLoading(false);
  };

  // ✨ 장소 선택 시 처리 로직 수정 ✨
  const handleSelectPlace = (place: SearchedPlace) => {
    navigation.navigate('Main', {
      screen: '경로', // 1. Main(BottomTab)의 '경로' 탭으로 이동
      params: {          // 2. '경로' 탭(RouteScreen)에 파라미터 전달
        selectedPlace: place,
        target: target,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={target === 'start' ? '출발지 검색' : '도착지 검색'}
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            returnKeyType="search"
          />
        </View>
      </View>

      {isLoading && query.length > 1 ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color={Colors.accentPrimary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceItem item={item} onPress={() => handleSelectPlace(item)} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query.length <= 1 ? '검색어를 2글자 이상 입력해주세요.' : '검색 결과가 없습니다.'}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

// ... (스타일은 기존과 동일)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: Colors.bgCard,
    },
    backButton: { padding: 5, marginRight: 10 },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.bgCard,
      borderRadius: 12,
      paddingHorizontal: 15,
    },
    searchIcon: { marginRight: 10 },
    input: {
      flex: 1,
      height: 48,
      color: Colors.textPrimary,
      fontSize: 16,
    },
    itemContainer: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: Colors.bgCard,
      alignItems: 'center',
    },
    itemIcon: { width: 30 },
    itemTextContainer: { flex: 1 },
    itemTitle: { color: Colors.textPrimary, fontSize: 16, marginBottom: 4 },
    itemSubtitle: { color: Colors.textSecondary, fontSize: 13 },
    emptyContainer: {
      flex: 1,
      marginTop: 100,
      alignItems: 'center',
    },
    emptyText: { color: Colors.textSecondary, fontSize: 16 },
  });
  

export default SearchScreen;
