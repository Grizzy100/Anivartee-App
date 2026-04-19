import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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
import { GlassCard } from '../../components/ui/GlassCard';
import { RoleToggle } from '../../components/ui/RoleToggle';

type UserRole = 'USER' | 'FACT_CHECKER';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useSession();
  const [role, setRole] = useState<UserRole>('USER');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);

    const result = await signUp(username, email, password, role);
    
    setLoading(false);
    if (result.ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Registration Failed', result.error || 'Please check your details.');
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the platform</Text>
                <View style={styles.divider} />
              </View>

              <RoleToggle value={role} onChange={setRole} />

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
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

                <View style={styles.spacer} />

                <Pressable 
                  style={[styles.button, loading && { opacity: 0.7 }]} 
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <Pressable onPress={() => router.push('/(auth)/sign-in')} hitSlop={8}>
                    <Text style={styles.link}>Log in</Text>
                  </Pressable>
                </View>
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
  spacer: {
    height: 20,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
