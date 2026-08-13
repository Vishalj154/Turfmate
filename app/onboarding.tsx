import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Colors, Spacing } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Find Your Game',
    description: 'Discover turfs and sports venues near you.',
    icon: 'search-outline' as any,
  },
  {
    id: '2',
    title: 'Book Your Slot',
    description: 'Choose your date and time in seconds.',
    icon: 'calendar-outline' as any,
  },
  {
    id: '3',
    title: 'Play More',
    description: 'Discover tournaments, resorts and sporting events.',
    icon: 'trophy-outline' as any,
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { isDark } = useApp();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const themeColors = isDark ? Colors.dark : Colors.light;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Button 
          title="Skip" 
          variant="ghost" 
          onPress={handleSkip} 
          style={{ alignSelf: 'flex-end' }} 
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconContainer, { backgroundColor: themeColors.surface, shadowColor: themeColors.textPrimary }]}>
              <Ionicons name={item.icon} size={80} color={themeColors.primary} />
            </View>
            <Text variant="h2" style={styles.title}>{item.title}</Text>
            <Text variant="body" color={themeColors.textSecondary} align="center" style={styles.description}>
              {item.description}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index.toString()}
                style={[
                  styles.dot,
                  { backgroundColor: themeColors.primary, opacity }
                ]}
              />
            );
          })}
        </View>
        
        <Button 
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"} 
          onPress={handleNext} 
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  }
});
