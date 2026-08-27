import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Share, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getRawDatabaseDump } from '../../database/localDatabase';

export default function ProfileScreen() {
  const { isDark, user, logout, themeMode, setThemeMode } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const [showDbModal, setShowDbModal] = useState<boolean>(false);
  const [loadingDb, setLoadingDb] = useState<boolean>(false);
  const [dbData, setDbData] = useState<{
    users: any[];
    bookings: any[];
    favorites: any[];
    venuesCount: number;
  } | null>(null);

  const handleOpenDatabaseInspector = async () => {
    setLoadingDb(true);
    setShowDbModal(true);
    try {
      const dump = await getRawDatabaseDump();
      setDbData(dump);
    } catch (e) {
      console.error('Error opening DB dump:', e);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out TurfMate — find and book sports turfs easily!',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleRate = () => {
    Alert.alert(
      'Rate TurfMate',
      'Rating will be available once TurfMate is published on the Play Store.'
    );
  };

  const MenuItem = ({ icon, title, value, onPress, hasSwitch, switchValue, onSwitch }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: themeColors.border }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: themeColors.surface }]}>
          <Ionicons name={icon} size={20} color={themeColors.primary} />
        </View>
        <Text variant="body" weight="medium">{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text variant="caption" color={themeColors.textSecondary} style={{ marginRight: 8 }}>{value}</Text>}
        {hasSwitch ? (
          <Switch value={switchValue} onValueChange={onSwitch} trackColor={{ true: themeColors.primary }} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
              <Text variant="h1" color={Colors.light.surface}>{user?.name?.charAt(0) || 'G'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text variant="h2">{user?.name || 'Guest User'}</Text>
              <Text variant="body" color={themeColors.textSecondary}>{user?.email || 'Login to access full features'}</Text>
            </View>
            {user?.isVerified && (
              <Ionicons name="checkmark-circle" size={24} color={themeColors.success} />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Card style={[styles.membershipCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.membershipHeader}>
              <Ionicons name="star" size={24} color={themeColors.accent} />
              <Text variant="h3" style={{ marginLeft: Spacing.sm }}>TurfMate Plus</Text>
            </View>
            <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.md }}>
              Unlock exclusive discounts, priority booking and earn more reward points.
            </Text>
            <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: themeColors.primary }]}>
              <Text variant="button" color={Colors.light.surface}>Upgrade Now</Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>Lab & Database Tools</Text>
            <Card style={{ padding: 0 }}>
              <MenuItem 
                icon="server-outline" 
                title="View Local SQLite Database" 
                value="turfmate.db"
                onPress={handleOpenDatabaseInspector} 
              />
            </Card>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>Preferences</Text>
            <Card style={{ padding: 0 }}>
              <MenuItem 
                icon="moon-outline" 
                title="Dark Mode" 
                hasSwitch 
                switchValue={themeMode === 'dark'} 
                onSwitch={(val: boolean) => setThemeMode(val ? 'dark' : 'light')} 
              />
              <MenuItem 
                icon="notifications-outline" 
                title="Notifications" 
                hasSwitch 
                switchValue={true} 
              />
              <MenuItem 
                icon="globe-outline" 
                title="Language" 
                value="English" 
              />
            </Card>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>Support</Text>
            <Card style={{ padding: 0 }}>
              <MenuItem 
                icon="help-circle-outline" 
                title="Help & Support" 
                onPress={() => router.push('/support')} 
              />
              <MenuItem 
                icon="document-text-outline" 
                title="Terms & Conditions" 
                onPress={() => router.push('/terms')} 
              />
              <MenuItem 
                icon="shield-checkmark-outline" 
                title="Privacy Policy" 
                onPress={() => router.push('/privacy')} 
              />
              <MenuItem 
                icon="information-circle-outline" 
                title="About TurfMate" 
                onPress={() => router.push('/about')} 
              />
              <MenuItem 
                icon="share-social-outline" 
                title="Share TurfMate" 
                onPress={handleShare} 
              />
              <MenuItem 
                icon="star-outline" 
                title="Rate TurfMate" 
                onPress={handleRate} 
              />
            </Card>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={themeColors.error} />
            <Text variant="body" weight="bold" color={themeColors.error} style={{ marginLeft: Spacing.sm }}>
              Log Out
            </Text>
          </TouchableOpacity>
          
          <Text variant="caption" align="center" color={themeColors.textSecondary} style={{ marginTop: Spacing.lg, marginBottom: Spacing.xxl }}>
            TurfMate v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Database Inspector Modal */}
      <Modal visible={showDbModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text variant="h2">🗄️ SQLite Database</Text>
                <Text variant="caption" color={themeColors.textSecondary}>File: turfmate.db</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDbModal(false)} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingDb ? (
              <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
                {/* USERS TABLE */}
                <View style={styles.tableHeaderRow}>
                  <Text variant="h3">👤 Table: users ({dbData?.users.length || 0})</Text>
                </View>
                {dbData?.users && dbData.users.length > 0 ? (
                  dbData.users.map((u, idx) => (
                    <Card key={u.id || idx} style={styles.dbRowCard}>
                      <Text variant="body" weight="bold">Name: {u.name || 'N/A'}</Text>
                      <Text variant="caption" color={themeColors.textSecondary}>Email: {u.email || 'N/A'}</Text>
                      <Text variant="caption" color={themeColors.textSecondary}>ID: {u.id}</Text>
                      <Text variant="caption" color={themeColors.primary}>Points: {u.points || 0}</Text>
                    </Card>
                  ))
                ) : (
                  <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.md }}>No user records in local SQLite.</Text>
                )}

                {/* BOOKINGS TABLE */}
                <View style={styles.tableHeaderRow}>
                  <Text variant="h3">🎟️ Table: bookings ({dbData?.bookings.length || 0})</Text>
                </View>
                {dbData?.bookings && dbData.bookings.length > 0 ? (
                  dbData.bookings.map((b, idx) => (
                    <Card key={b.id || idx} style={styles.dbRowCard}>
                      <Text variant="body" weight="bold">ID: {b.id}</Text>
                      <Text variant="caption" color={themeColors.textSecondary}>Venue ID: {b.venueId}</Text>
                      <Text variant="caption">Date: {b.date} | Time: {b.timeSlot}</Text>
                      <Text variant="caption" weight="bold" color={b.status === 'Cancelled' ? themeColors.error : themeColors.success}>
                        Amount: ₹{b.amount} | Status: {b.status}
                      </Text>
                    </Card>
                  ))
                ) : (
                  <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.md }}>No bookings in local SQLite.</Text>
                )}

                {/* SUMMARY STATS */}
                <View style={styles.tableHeaderRow}>
                  <Text variant="h3">📊 Cached Datasets</Text>
                </View>
                <Card style={styles.dbRowCard}>
                  <Text variant="body">Saved Favorites: {dbData?.favorites.length || 0}</Text>
                  <Text variant="body">Cached Venues: {dbData?.venuesCount || 0}</Text>
                </Card>
              </ScrollView>
            )}

            <Button 
              title="Close Database Inspector" 
              variant="outline" 
              onPress={() => setShowDbModal(false)}
              style={{ marginTop: Spacing.md }} 
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  membershipCard: {
    marginBottom: Spacing.xl,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  upgradeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
    paddingBottom: Spacing.sm,
  },
  closeBtn: {
    padding: 4,
  },
  tableHeaderRow: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  dbRowCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  }
});
