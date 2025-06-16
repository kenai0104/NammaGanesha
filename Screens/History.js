import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper function to format date and time
const formatDateTime = (isoString) => {
  const dateObj = new Date(isoString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return dateObj.toLocaleString('en-US', options);
};

const History = ({ navigation, route }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = route.params;

  console.log(id);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://japa-lfgw.onrender.com/posts/${id}`);
        const data = await response.json();

        if (response.ok) {
          setHistoryData(data);
        } else {
          console.warn('Error fetching history:', data.message || 'Failed to load history.');
        }
      } catch (error) {
        console.error('Error fetching history:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.headerGradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Image
                source={require('../assets/left-arrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>History</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF7E5F" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
          >
            {historyData.length === 0 ? (
              <Text style={styles.noDataText}>No history records available.</Text>
            ) : (
              historyData.map((record, index) => (
                <View key={index} style={styles.historyCard}>
                  <Text style={styles.historyCardTitle}>Japa Record {index + 1}</Text>
                  <Text style={styles.historyDetail}>Name: {record.name}</Text>
                  <Text style={styles.historyDetail}>Tower: {record.tower}</Text>
                  <Text style={styles.historyDetail}>Flat: {record.flat}</Text>
                  <Text style={styles.historyDetail}>Japa Name: {record.japaName}</Text>
                  <Text style={styles.historyDetail}>Japa Count: {record.japaCount}</Text>
                  <Text style={styles.historyDetail}>
                    Date & Time: {formatDateTime(record.date)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
};

export default History;

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    // borderBottomLeftRadius: 10,
    // borderBottomRightRadius: 10,
  },
  header: {
    paddingVertical: 13,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    zIndex: 1,
  },
  backIcon: {
    width: 15,
    height: 15,
    tintColor: '#FFF',
    marginLeft: 10,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  historyCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#FF7E5F',
  },
  historyDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#aaa',
    marginTop: 20,
  },
});
