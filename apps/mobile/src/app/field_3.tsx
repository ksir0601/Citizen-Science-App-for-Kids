import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link } from 'expo-router';
import Screen from "../components/Screen";
import { useState } from "react";

export default function field_3() {
    const items = [0, 1, 2, 3, 4,5];
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
      <Text style={styles.title}>What bugs did you see? Tap every kind of bug you spotted!</Text>

    </View>
    
        <View style={styles.grid}>
            {items.map((i) => (
                <View key={i} style={styles.cell}>
                    <View style={styles.cellStyle} />
                </View>
            ))}
        </View>



    <View style={styles.footerRow}>
    <Link href="/field_2" asChild>
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
    <Link href="/field_4" asChild>
        <Pressable>
            <Text style={styles.footerRight}>
                Next
            </Text>
        </Pressable>
    </Link>
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
    fontSize: 16,
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
  footerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    top: 100,
  },
  footerLeft:{
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    paddingRight: 75,
  },
  footerRight:{
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    paddingLeft: 75,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: '33.33%',
        padding: 8,
    },
    cellStyle: {
        aspectRatio: 1,
        backgroundColor: "#81B29A",
        borderRadius: 12,
    }
});