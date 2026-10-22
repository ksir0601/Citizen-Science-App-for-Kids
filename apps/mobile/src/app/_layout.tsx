import { Stack  } from "expo-router";
import AppBanner from "../components/appBanner";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ header: () => <AppBanner />}}>
      <Stack.Screen name="index" />
      <Stack.Screen name="projects"/>
      <Stack.Screen name="project_dscr" />
      <Stack.Screen name="field_1" />
      <Stack.Screen name="field_2" />
    </Stack>
  );
}
