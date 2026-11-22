import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link, useLocalSearchParams } from 'expo-router';
import Screen from "../components/Screen";
import NavBar from "@/components/NavBar";
import QuestionInput from "@/components/Switch";
import { useProject } from "@/lib/ProjectContext"; 
import { useDraftAnswer } from "./hooks/useDraftAnswer";


export default function Field_4() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { questions } = useProject();
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[3];

    const {draft, setDraft, commit} = useDraftAnswer(question?.id ?? "")
 
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
    <Link href={{ pathname: '/field_3', params: { projectId } }} asChild onPress={commit}>
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
    <Link href={{ pathname: '/optional', params: { projectId } }} asChild onPress={commit}>
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
