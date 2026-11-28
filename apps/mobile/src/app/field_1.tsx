import NavBar from "@/components/NavBar";
import Screen from "@/components/Screen";
import QuestionInput from "@/components/Switch";
import { useProject } from "@/lib/ProjectContext";
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDraftAnswer } from "./hooks/useDraftAnswer";

export default function Field_1() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { project, questions } = useProject();
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[0];
  const {draft, setDraft, commit} = useDraftAnswer(question?.id ?? "")



  return (
    <Screen> 
      <NavBar/>
    <View style={styles.container}>
    <View>
  
    </View>
      <Text style={styles.title}>{project?.name}</Text>

    <Text style={styles.proj_desc}>{question?.label}</Text>

    {question && (
      <QuestionInput
        question={question}
        draft={draft}
        setDraft={setDraft}
        />
    )}

    </View>
    <Link href={{ pathname: '/field_2', params: { projectId } }} asChild onPress={commit}>
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
 
    proj_desc:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 10,
    textAlign: 'center',
    color: '#CCCCCC'
  },
  entry:{
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    fontFamily: "PlaypenSan-Bold",
  }
  });
