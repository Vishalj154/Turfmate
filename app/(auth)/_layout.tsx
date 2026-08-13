import { Stack } from 'expo-router';
import { useApp } from '../../store/AppContext';
import { Colors } from '../../theme';

export default function AuthLayout() {
  const { isDark } = useApp();
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor }
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
