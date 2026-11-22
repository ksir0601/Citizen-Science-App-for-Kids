import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link, useLocalSearchParams } from 'expo-router';
import Screen from "../components/Screen";
import { useProject } from "@/lib/ProjectContext";
import NavBar from "@/components/NavBar";

export default function ProjectDscr() {
    const {projectId } = useLocalSearchParams<{ projectId: string }>();
    const { project: joined } = useProject();
    const project = joined?.id === projectId ? joined : null;

    if (!project){
      return (
        <Screen>
          <Text style={styles.description}>Project not found.</Text>
        </Screen>
      )
    }
    return (
    <Screen> 
      <NavBar/>

      <View style={styles.container}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.dscr_head}>Description</Text>
        <Text style={styles.description}>{project.description}</Text>

      </View>

    <Link href={{ pathname: "/field_1", params: { projectId: project.id } }} asChild>
        <Pressable>
            <Text style={styles.entry}>
                Add New Journal Entry
            </Text>
        </Pressable>
    </Link>

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlaypenSan-Bold",
    marginBottom: 10,
    color: '#CCCCCC',
    textAlign: 'center',
    
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
  },
    dscr_head: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textDecorationLine: "underline",
    },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
    logout:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginLeft: 50,
    color: '#CCCCCC'
  },
    projects:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginRight: 50,
    color: '#CCCCCC'
  },

    proj_desc:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 10,
    textAlign: 'center',
    color: '#CCCCCC'
  },
    entry: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});