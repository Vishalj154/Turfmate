import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../theme';
import { useApp } from '../../store/AppContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { login, isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const handleRegister = () => {
    // Just mock logging in after register
    login(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="h1" style={styles.title}>Create Account</Text>
            <Text variant="body" color={themeColors.textSecondary}>Join TurfMate today!</Text>
          </View>

          <View style={styles.form}>
            <Input 
              label="Full Name"
              placeholder="Enter your name"
              leftIcon="person-outline"
            />
            <Input 
              label="Email Address"
              placeholder="Enter your email"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input 
              label="Phone Number"
              placeholder="Enter your phone"
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />
            <Input 
              label="Password"
              placeholder="Create a password"
              leftIcon="lock-closed-outline"
              isPassword
            />
            <Input 
              label="Confirm Password"
              placeholder="Confirm your password"
              leftIcon="lock-closed-outline"
              isPassword
            />
            
            <Button 
              title="Create Account" 
              onPress={handleRegister} 
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text variant="body" color={themeColors.textSecondary}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Text variant="button" color={themeColors.primary}>Login</Text>
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
    marginBottom: Spacing.xxl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
