import { View, StyleSheet  } from "react-native";
import { Picker } from '@react-native-picker/picker';



type Props = {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}

export default function DropDown({options, value, onChange}: Props) {
  return (
              <View style={styles.dropEntry}>
                <Picker
                  selectedValue={value ?? ''}
                  onValueChange={(itemValue) => {
                    if(itemValue !== '') onChange(itemValue)
                  }}
                  style={styles.picker}
                  >
             
                  {options.map((o) => (
                    <Picker.Item
                    key={o}
                    label={o}
                    value={o}
                    style={styles.dropDownText}
                    />
                  ))}
                </Picker>
            </View>
    );
}

const styles = StyleSheet.create({
    entry: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textAlign: 'center',
    },
  dropEntry: {
    backgroundColor: '81B29A',
    width: 240, 
    borderRadius: 16,
    overflow: 'hidden',
  },
  picker: {
    color: "#CCCCCC",
    backgroundColor: "#81B29A"
  },
  dropDownText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});