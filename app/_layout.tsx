import { useEffect } from 'react';
import { AppProvider } from './AppContext';
import { Slot, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            const parsed = Linking.parse(url);
            if (parsed.path === 'login') {
                router.replace('/(auth)/login');
            }
        };

        Linking.getInitialURL().then((url) => {
            if (url) {
                const parsed = Linking.parse(url);
                if (parsed.path === 'login') {
                    router.replace('/(auth)/login');
                }
            }
        });

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
                <Slot />
            </AppProvider>
        </GestureHandlerRootView>
    );
}
