import { setHasAttemptedToHideSplash } from 'expo-router/build/global-state/store';
import { Text, StyleSheet, TextStyle } from 'react-native';

type ScreenTitleProps = {
    children?: React.ReactNode;
    style?: TextStyle;
};

export default function ScreenTitle({ children, style }: ScreenTitleProps) {
    return <Text style={[ styles.title, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
    title: {
        color: "#CCCCCC",
        fontFamily: 'PlaypenSans-Bold',
        fontSize: 24,
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 20,
    },
});