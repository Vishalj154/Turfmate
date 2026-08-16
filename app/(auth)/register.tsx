import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../theme';
import { useApp } from '../../store/AppContext';
import { registerUser } from '../../services/authService';
import { createUserProfile } from '../../services/userService';
import { getFirebaseAuthErrorMessage } from '../../services/firebaseErrors';

export default function RegisterScreen() {
  const router = useRouter();
  const { login, isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): boolean => {
    setError('');
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const user = await registerUser(email, password);
      
      await createUserProfile(user.uid, {
        id: user.uid,
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoURL: null,
        city: '',
        membership: 'free',
        rewardPoints: 0,
        walletBalance: 0
      });
      
      login(false);
    } catch (err: unknown) {
      console.error('Firebase Auth Error:', err);
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
            {error ? (
              <View style={styles.errorContainer}>
                <Text variant="body" color={themeColors.error}>{error}</Text>
              </View>
            ) : null}

            <Input 
              label="Full Name"
              placeholder="Enter your name"
              leftIcon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
            <Input 
              label="Email Address"
              placeholder="Enter your email"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <Input 
              label="Phone Number"
              placeholder="Enter your phone"
              leftIcon="call-outline"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
            <Input 
              label="Password"
              placeholder="Create a password"
              leftIcon="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <Input 
              label="Confirm Password"
              placeholder="Confirm your password"
              leftIcon="lock-closed-outline"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            
            <Button 
              title="Create Account" 
              onPress={handleRegister} 
              style={styles.registerButton}
              loading={loading}
              disabled={loading}
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
  errorContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 8,
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
