import { Stack  } from "expo-router";
import AppBanner from "../components/appBanner";
import { FormDataProvider } from "@/app/context/FormConext";
<<<<<<< HEAD
import { ProjectProvider } from "@/lib/ProjectContext";

export default function RootLayout() {
  return (
  <ProjectProvider>
=======

export default function RootLayout() {
  return (
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
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
<<<<<<< HEAD
  </ProjectProvider>
=======
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
  );
}
