import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import {
    Orbitron_400Regular,
    Orbitron_700Bold,
    useFonts,
} from "@expo-google-fonts/orbitron";
import {
    Oxanium_400Regular,
    Oxanium_600SemiBold,
    Oxanium_700Bold,
} from "@expo-google-fonts/oxanium";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SessionProvider } from "../ctx";

const { width, height } = Dimensions.get("window");

export default function RootLayout() {
  useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    Oxanium_400Regular,
    Oxanium_600SemiBold,
    Oxanium_700Bold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0B1220").catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />

      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SessionProvider>

      {showCustomSplash && <CustomSplashScreen />}
    </GestureHandlerRootView>
  );
}

function CustomSplashScreen() {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={StyleSheet.absoluteFill}
    >
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.splashBg}
        resizeMode="cover"
      >
        <View style={styles.splashContent}>
          <Image
            source={require("../assets/images/logo-new-removebg-preview.png")}
            style={styles.splashLogo}
            contentFit="contain"
          />
          <Text style={styles.splashText}>Anivartee</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashBg: {
    flex: 1,
    width: width,
    height: height,
  },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  splashLogo: {
    width: 400,
    height: 400,
    backgroundColor: "transparent",
  },
  splashText: {
    marginTop: -80, // less space below logo
    fontSize: 30,
    color: "#FFFFFF",
    fontFamily: "Orbitron_700Bold",
    letterSpacing: 2,
    width: 270,
    textAlign: "center",
    alignSelf: "center",
  },
});
