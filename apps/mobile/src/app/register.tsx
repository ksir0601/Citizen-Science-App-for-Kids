import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
// import { Image } from "expo-image";
import ScreenTitle from "../components/ScreenTitle";
import Screen from "../components/Screen";
import { Link } from 'expo-router';


export default function Register() {
  return (
    <Screen>
      <ScreenTitle>Citizen Science Jr</ScreenTitle>
      <View style={styles.inputGroup}>
      <Text style={styles.label}>Student Nickname</Text>
      <TextInput 
      style={styles.input}
      placeholder=""
      />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Class Code</Text>
        <TextInput
        style={styles.input}/>
      </View>

           <View style={styles.inputGroup}>
        <Text style={styles.label}>Grade</Text>
        <TextInput
        style={styles.input}/>
      </View>
           <View style={styles.inputGroup}>
        <Text style={styles.label}>Teacher's Name</Text>
        <TextInput
        style={styles.input}/>
      </View>
   
      
      <Link href="/projects" asChild>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Register!</Text>
      </Pressable>
      </Link>
    </Screen>
  )
}

const styles = StyleSheet.create({
  inputGroup: {
    width: "50%",
    alignItems: 'flex-start',
    marginTop: 20,
  },
  input: {
    width: 200,
    marginTop: 4,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EFEFD0',
  },
  label:{
    fontSize: 16,
    fontFamily: 'PlaypenSan-SemiBold',
    color: '#CCCCCC',
    // marginBottom: 6

  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: '#81B29A'
  },
  buttonText: {
    color: '#CCCCCC',
    fontFamily: 'PlaypenSans-Bold',
  },

  register: {
    fontSize: 10,
    textDecorationLine: 'underline',
    alignItems: 'center',
    paddingTop: 300,
    color: '#CCCCCC'

  }
})