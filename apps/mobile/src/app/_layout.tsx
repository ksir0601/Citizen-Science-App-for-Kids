import { Stack  } from "expo-router";
import AppBanner from "../components/appBanner";
import { FormDataProvider } from "@/app/context/FormConext";

export default function RootLayout() {
  return (
    <FormDataProvider>
      <Stack screenOptions={{ header: () => <AppBanner />}}>
        <Stack.Screen name="index" />
        <Stack.Screen name="projects"/>
        <Stack.Screen name="project_dscr" />
        <Stack.Screen name="field_1" />
        <Stack.Screen name="field_2" />
        <Stack.Screen name="field_3" />
        <Stack.Screen name="field_4" />
      </Stack>
    </FormDataProvider>
  );
}
