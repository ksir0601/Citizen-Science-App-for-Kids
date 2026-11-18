import {StyleSheet, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChange: (v: string) => void 
}



export default function Text_entry({value, onChange}: Props) {

  return (
    
      <View>
        <View style={styles.background}>
        <TextInput
          style={styles.input}
          onChangeText={onChange}
          value={String(value)}
          placeholder="Enter answer here"
          keyboardType="default"
        />
        </View>
        </View>

  );
}


const styles = StyleSheet.create({
    input: {
   
        padding: 20,
        fontSize: 14,
        lineHeight: 22,
        color: '#CCCCCC',
        fontFamily: 'PlaypenSan-Bold',
  },
  background:{
    backgroundColor: '#81B29A',
    padding: 5,
    borderRadius: 16,
    
  },

 });