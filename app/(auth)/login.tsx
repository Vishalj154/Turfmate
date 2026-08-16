import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const handleLogin = () => {
    login(false);
  };

  const handleGuestLogin = () => {
    login(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: themeColors.primary }]}>
              <Ionicons name="football" size={40} color={Colors.light.surface} />
            </View>
            <Text variant="h1" style={styles.title}>Welcome Back</Text>
            <Text variant="body" color={themeColors.textSecondary}>Sign in to continue to TurfMate</Text>
          </View>

          <View style={styles.form}>
            <Input 
              label="Email Address"
              placeholder="Enter your email"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input 
              label="Password"
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              isPassword
            />
            
            <View style={styles.forgotPassword}>
              <Link href={"/(auth)/forgot-password" as any} asChild>
                <Text variant="button" color={themeColors.primary}>Forgot Password?</Text>
              </Link>
            </View>

            <Button 
              title="Login" 
              onPress={handleLogin} 
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: themeColors.border }]} />
              <Text variant="caption" style={{ paddingHorizontal: Spacing.sm }}>OR</Text>
              <View style={[styles.line, { backgroundColor: themeColors.border }]} />
            </View>

            <Button 
              title="Continue as Guest" 
              variant="outline"
              onPress={handleGuestLogin} 
              style={styles.guestButton}
            />

            <View style={styles.registerContainer}>
              <Text variant="body" color={themeColors.textSecondary}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Text variant="button" color={themeColors.primary}>Sign Up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginBottom: Spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
  },
  guestButton: {
    marginBottom: Spacing.xl,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
