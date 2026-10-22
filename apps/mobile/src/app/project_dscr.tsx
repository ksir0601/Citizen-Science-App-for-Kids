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
    <Text style={styles.dscr_head}>
        Description
    </Text>
      <Text style={styles.description}>

        There are many ways of determining the health
    of ecosystems. One is biodiversity. According to 
    Merriam Webster dictionary Biodiversity: 
    “biological diversity in an environment as
    indicated by numbers of different species
    of plants and animals”. In this project you will 
    count the number of species of bugs you can find
    in different ecosystems. 
      </Text>
    </View>

    <Link href="/field_1" asChild>
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