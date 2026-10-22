import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import ScreenTitle from "@/componets/ScreenTitle";
import Screen from "@/componets/Screen";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <Screen>
      <ScreenTitle>Citizen Science Jr</ScreenTitle>
      <View style={styles.inputGroup}>
      <Text style={styles.label}>Username</Text>
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
      <Link href='/projects' asChild>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
      </Link>
      <Link href='/register' asChild>
      <Pressable>
        <Text style={styles.register}>Don't have an accout? Register here</Text>
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