import { View, StyleSheet } from 'react-native';

type ScreenProps = {
    children?: React.ReactNode;
}

export default function Screen({ children }: ScreenProps) {

    return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3D405B',
        alignItems: 'center',
    },
})