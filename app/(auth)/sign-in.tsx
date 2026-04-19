import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useSession } from '../../ctx';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

type UserRole = 'USER' | 'FACT_CHECKER';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);

    const result = await signIn(email, password);
    
    setLoading(false);
    if (result.ok) {
      // Redirect based on role or to common dashboard
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', result.error || 'Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../assets/images/SignIn.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GlassCard style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Log In to Your Account</Text>
                <Text style={styles.subtitle}>Welcome back</Text>
                <View style={styles.divider} />
              </View>

              {/* Role Toggle removed for Sign In */}

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="rgba(255,255,255,0.6)"
                    />
                  </Pressable>
                </View>

                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>

                <Pressable 
                  style={[styles.button, loading && { opacity: 0.7 }]} 
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Text
                    style={styles.link}
                    onPress={() => router.push('/(auth)/sign-up')}
                  >
                    Sign up
                  </Text>
                </Text>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 8, 22, 0.45)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  card: {
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    height: 42,
    backgroundColor: 'rgba(7, 14, 27, 0.65)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  button: {
    height: 44,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#1D2230',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  link: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
