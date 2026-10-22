import { View, StyleSheet, ViewStyle } from 'react-native';

type ScreenProps = {
    children?: React.ReactNode;
    style?: ViewStyle;
}

export default function Screen({ children, style}: ScreenProps) {
    return <View style={[ styles.container, style]}>{children}</View>;
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3D405B',
        alignItems: 'center',
    },
})