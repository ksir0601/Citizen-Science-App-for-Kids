import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import { Link } from 'expo-router';
import Screen from "@/componets/Screen";

export default function ProjectDscr() {
  return (
    <Screen> 
    <View style={styles.row}>
    <Link href='/projects' asChild>
    <Pressable>
    <Text style={styles.projects}>Projects</Text>
    </Pressable>
    </Link>
    <Link href='/' asChild>
    <Pressable>
    <Text style={styles.logout}>Log Out</Text>
    </Pressable>
    </Link>
    </View>
    <View style={styles.container}>
    <View>
  
    </View>
      <Text style={styles.title}>Schoolyard Bug Count</Text>
      <Text style={styles.description}>
        Description goes here!
      </Text>
    </View>
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
    
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
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
    marginLeft: 75,
    color: '#CCCCCC'
  },
    projects:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginRight: 75,
    color: '#CCCCCC'
  },
});