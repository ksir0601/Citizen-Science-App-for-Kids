import { View, Pressable, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
import { Link } from 'expo-router';
import Screen from "../components/Screen";
import { useState } from "react";

export default function Field_4() {
    const [text, setText] = useState('');
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

      <View>
      <Text style={styles.title}>Optional Field Notes!</Text>
    </View>
    
<Pressable onPress={Keyboard.dismiss}>
      <View style={styles.textContainer}>
        
        <TextInput 
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder= "Add a note!"
            placeholderTextColor= "black"
        />

        </View>       
     </Pressable>
        


    <View style={styles.footerRow}>
    <Link href="/field_3" asChild>
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
    <Link href="/review" asChild>
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
  counterBottun: {
    width: 44,
    height:44,
    borderRadius: 22,
    alignItems:'center',
    justifyContent: 'center'
  },

  counterText: {
    color: '#CCCCCC',
    fontFamily: 'PlaypenSans',
    fontSize: 40,
  },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20
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
    top: 300,
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

    input: {
        width: 240,
        height: 120,
        paddingHorizontal: 12,
        borderRadius: 12,
        textAlign: 'left',
        textAlignVertical: 'top'

    },
    textContainer: {
        top: '10%',
        left: '2.25%',
        width: 280,
        height:200,
        backgroundColor: "#fff",
    },
    presCont:{
        top: '10%',
        left: '2.25%',
        width: 280,
        height:200,        
        justifyContent: 'center',
        alignItems:'center',
        backgroundColor: "#3D405B"
    }
});
