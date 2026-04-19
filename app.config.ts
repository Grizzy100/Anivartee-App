import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    services: {
      userServiceUrl: process.env.EXPO_PUBLIC_USER_SERVICE_URL,
      postServiceUrl: process.env.EXPO_PUBLIC_POST_SERVICE_URL,
      pointsServiceUrl: process.env.EXPO_PUBLIC_POINTS_SERVICE_URL,
      paymentServiceUrl: process.env.EXPO_PUBLIC_PAYMENT_SERVICE_URL,
    },
  },
});
