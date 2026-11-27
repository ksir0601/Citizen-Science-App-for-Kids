import { Text, View, StyleSheet, Pressable} from "react-native";
import { useLocalSearchParams, Link } from 'expo-router';
import Screen from "@/components/Screen";
import NavBar from "@/components/NavBar";
import QuestionInput from "@/components/Switch";
<<<<<<< HEAD
import { useProject } from "@/lib/ProjectContext";
=======
import { projects, questions } from "@/mock/mockData";
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
import { useDraftAnswer } from "./hooks/useDraftAnswer";

export default function Field_1() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
<<<<<<< HEAD
  const { project, questions } = useProject();
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[0];
  const {draft, setDraft, commit} = useDraftAnswer(question?.id ?? "")
=======
  const {userId } = useLocalSearchParams<{userId: string}>(); 
  const project = projects.find((p) => p.id === projectId);
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[0];
  const {draft, setDraft, commit} = useDraftAnswer(question.id)
>>>>>>> e72e5735b698d21538c9d176698649507ed86805



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
<<<<<<< HEAD
    <Link href={{ pathname: '/field_2', params: { projectId } }} asChild onPress={commit}>
=======
    <Link href={{ pathname: '/field_2', params: { projectId, userId } }} asChild onPress={commit}>
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
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
<<<<<<< HEAD
 
=======

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
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
    proj_desc:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 10,
    textAlign: 'center',
    color: '#CCCCCC'
  },
  entry:{
    fontSize: 14,
<<<<<<< HEAD
=======
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginRight: 50,
    color: '#CCCCCC'
  },
  entry:{
    fontSize: 14,
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
    color: '#CCCCCC',
    textAlign: 'center',
    fontFamily: "PlaypenSan-Bold",
  }
  });
