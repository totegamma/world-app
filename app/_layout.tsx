import { Redirect, Slot, useSegments } from 'expo-router';
import { Text } from 'react-native';
import { ClientProvider, useClient } from '../context/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';



function RootNavigation() {

    console.log("RootNavigation rendered");

    const client = useClient();
    const segments = useSegments();


    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (client.initializing) {
        return <Text>oOoOoOoOoOoOoOo</Text>;
    } 

    if (!client.host && !inAuthGroup) {
        return <Redirect href="/welcome" />;
    }

    if (client.host && !inAppGroup) {
        return <Redirect href="/" />;
    }

    return <Slot />;
}


export default function RootLayout() {
    return (
        <ClientProvider>
            <SafeAreaProvider>
                <RootNavigation />
            </SafeAreaProvider>
        </ClientProvider>
    )
}

