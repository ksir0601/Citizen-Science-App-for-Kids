import { StyleSheet, View, ViewStyle } from 'react-native';

import { Image, ImageSource } from 'expo-image';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const banner = require('@/assets/images/app_banner.png');
// console.log("banner rendered")

type AppBannerProps = {
    source?: ImageSource;
    width?: number;
    height?: number;
    style?: ViewStyle;
};

export default function AppBanner({
    source = banner,
    width = 320,
    height = 45,
    style,
}: AppBannerProps) {
    const inset = useSafeAreaInsets();
    return (
        <View style={[styles.header, {paddingTop: inset.top + 8}]}> 
        <Image
        source={source}
        style={{ width, height, borderRadius: 18}}
        />
        </View>
    
    )
}


const styles = StyleSheet.create({
    header: {
        backgroundColor: '#3D405B',
        alignItems: 'center',
        paddingBottom: 8,
    }
});