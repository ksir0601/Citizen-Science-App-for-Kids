import {StyleSheet, TextInput, View} from 'react-native';


type Props = {
  value: number | "";
  onChange: (v: number | "") => void;
};

export default function Number_entry({value, onChange}: Props ){

  const handleChange = (text: string) => {
    if (text === '') {
      onChange('')
      return;
    }
    const parsed = parseInt(text, 10);
    if (!Number.isNaN(parsed)) {
      onChange(parsed)
    }
  };

  return (
    
        <View>
        <View style={styles.background}>
        <TextInput
          style={styles.input}
          onChangeText={handleChange}
          value={String(value)}
          placeholder=""
          keyboardType="numeric"
        />
        </View>
        </View>

  );
}

const styles = StyleSheet.create({
    input: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textAlign: 'center',
    fontFamily: 'PlaypenSan-Bold',
  },
  background:{
    backgroundColor: '#81B29A',
    padding: 5,
    borderRadius: 16,
    overflow: "hidden"
  },
 });