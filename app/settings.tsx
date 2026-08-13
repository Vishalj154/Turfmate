import React from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Text';
import { Colors, Spacing } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const renderSectionHeader = (title: string) => (
    <Text variant="caption" color={themeColors.textSecondary} style={styles.sectionHeader}>
      {title.toUpperCase()}
    </Text>
  );

  const renderItem = (icon: string, title: string, hasSwitch?: boolean, value?: boolean, onValueChange?: (v: boolean) => void) => (
    <View style={[styles.item, { borderBottomColor: themeColors.border }]}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon as any} size={22} color={themeColors.textSecondary} style={{ marginRight: Spacing.md }} />
        <Text variant="body">{title}</Text>
      </View>
      {hasSwitch ? (
        <Switch value={value} onValueChange={onValueChange} trackColor={{ true: themeColors.primary }} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderSectionHeader('Appearance')}
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          {renderItem('moon-outline', 'Dark Mode', true, themeMode === 'dark', (val) => setThemeMode(val ? 'dark' : 'light'))}
          {renderItem('color-palette-outline', 'System Theme', true, themeMode === 'system', (val) => {
            if (val) setThemeMode('system');
            else setThemeMode(isDark ? 'dark' : 'light');
          })}
        </View>

        {renderSectionHeader('Notifications')}
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          {renderItem('calendar-outline', 'Booking Alerts', true, true)}
          {renderItem('pricetag-outline', 'Offers & Promos', true, true)}
          {renderItem('trophy-outline', 'Tournament Updates', true, false)}
        </View>

        {renderSectionHeader('About')}
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          {renderItem('document-text-outline', 'Terms of Service')}
          {renderItem('shield-checkmark-outline', 'Privacy Policy')}
          {renderItem('information-circle-outline', 'About TurfMate')}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  backButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    marginTop: Spacing.md,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
