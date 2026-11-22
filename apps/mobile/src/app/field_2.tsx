import { Text, View, StyleSheet, Pressable} from "react-native";
import { useLocalSearchParams, Link } from 'expo-router';
import Screen from "@/components/Screen";
import NavBar from "@/components/NavBar";
import QuestionInput from "@/components/Switch";
import { useProject } from "@/lib/ProjectContext"; 
import { useDraftAnswer } from "./hooks/useDraftAnswer";




export default function Field_2() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { questions } = useProject();
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[1];
  const {draft, setDraft, commit } = useDraftAnswer(question?.id ?? "")
 


  return (
    <Screen> 
      <NavBar/>
    <View style={styles.container}>
    <View>
      <Text style={styles.description}>{question?.label}</Text>
  
    </View>
    {question && (
        <QuestionInput
          question={question}
          draft={draft}
          setDraft={setDraft}
        />
      )}
    </View>
    <View style={styles.footerRow}>
    <Link href={{ pathname: '/field_1', params: { projectId } }} asChild>
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
    <Link href={{ pathname: '/field_3', params: { projectId } }} asChild onPress={commit}>
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
});