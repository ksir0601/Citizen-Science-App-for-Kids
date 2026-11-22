import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import ScreenTitle from "../components/ScreenTitle";
import Screen from "../components/Screen";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useProject } from "@/lib/ProjectContext";


export default function Index() {

  // Router used in place of <Link> this allows from params
  const router = useRouter();
  const [projectCode, setProjectCode] = useState('');
  const [error, setError] = useState('');
  const { join: joinWithCode, nickname, setNickname } = useProject();


  const join = async () => {
    try {
      const { project, error: joinError } = await joinWithCode(projectCode);

      if (joinError || !project) {
        console.log("joinProject failed:", joinError);
        setError("Oops it looks like that is the wrong project code!"); 
        return;
      }
      router.push({pathname: '/project_dscr', params: { projectId: String(project.id)}} as any);
    } catch (err) {
      console.log("joinProject failed:", err)
    }
  };

  return (
    <Screen>
      <ScreenTitle>Citizen Science Jr</ScreenTitle>
      <View style={styles.inputGroup}>
      <Text style={styles.label}>Nickname</Text>
      <TextInput 
      style={styles.input}
      placeholder=""
      maxLength={30}
      value={nickname}
      onChangeText={setNickname}
      />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project Code</Text>
        <TextInput
        style={styles.input}
        placeholder=""
        onChangeText={(t) => {
          setProjectCode(t);
          if (error) setError('');
        }}
        value={projectCode}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      
      <Pressable style={styles.button} onPress={join}>
      
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
      <Link href='/register' asChild>
      <Pressable>
        <Text style={styles.register}> {"Don't have an account? Register here"}</Text>
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

  },
  error: {
    color: "#E07A5F",
    fontSize: 14,
    marginTop: 6,
  }
});