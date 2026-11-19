import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import Screen from "../components/Screen";
import NavBar from "@/components/NavBar";
import EditableField from "@/components/reviewEdit";
import { questions } from "@/mock/mockData";
import * as api from "@/mock/mockApi"


export default function Review() {
  const { projectId } = useLocalSearchParams<{projectId: string }>();

  const projectQuestions = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position);

 

  return (
    <Screen>
      <NavBar />
      <View>
        <Text style={styles.title}>Review your data!</Text>
      </View>

      <View>
     
        {projectQuestions.map((q) => (
          <EditableField key={q.id} question={q} />
        ))}
      </View>

      <View style={styles.footerRow}>
        <Link href="/project_dscr" asChild>
          <Pressable>
            <Text style={styles.footerLeft}>Back</Text>
          </Pressable>
        </Link>
        <Pressable onPress={api.addObservation}>
          <Text style={styles.footerRight}>Submit!</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({

  title: {
    fontSize: 16,
    fontFamily: "PlaypenSan-Bold",
    marginBottom: 10,
    color: '#CCCCCC',
    textAlign: 'center',
    
  },
 footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  list: {
    flex: 1,
},
  listContent: {
    paddingBottom: 16,
},
});