import { Text, View, StyleSheet, Pressable } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import Screen from "../components/Screen";
import { useState } from 'react'

export default function ProjectDscr() {
    const [selected, setSelected] = useState("Playground");
  return (
    <Screen> 
    <View style={styles.row}>
    <Link href='/projects' asChild>
    <Pressable>
    <Text style={styles.projects}>Projects</Text>
    </Pressable>
    </Link>
    <Link href='/project_dscr'>
        <Pressable>
            <Text style={styles.proj_desc}>Projects Description</Text>
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
        
    </Text>
      <Text style={styles.description}>

 Every little habitat has a story! Pick your spot.
      </Text>
    </View>
    <View>
        <Picker selectedValue={selected} onValueChange={setSelected}>
        <Picker.Item label="Playground" value="Playground" />
        </Picker>
    </View>

    <Link href={'/field_2'}>
        <Pressable>
            <Text style={styles.entry}>
                Next
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
    proj_desc:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 10,
    textAlign: 'center',
    color: '#CCCCCC'
  },
    projects:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginRight: 50,
    color: '#CCCCCC'
  },
    entry: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});