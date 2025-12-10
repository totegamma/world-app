import { Api, GenerateIdentity, InMemoryKVS, MasterKeyAuthProvider } from '../../lib';
import { Text, StyleSheet, Platform, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reloadAppAsync } from "expo";

export default function Welcome() {

    const register = (host: string) => {
        let init = async () => {
            const identity = GenerateIdentity();

            const authProvider = new MasterKeyAuthProvider(identity.privateKey, host);
            const cacheEngine = new InMemoryKVS();

            const api = new Api(authProvider, cacheEngine)

            const document = {
                author: identity.CCID,
                schema: 'https://schema.concrnt.net/affiliation.json',
                value: {
                    'domain': host,
                },
                createdAt: new Date().toISOString(),
            }

            const docString = JSON.stringify(document);
            const signature = authProvider.sign(docString);

            const request = {
                affiliationDocument: docString,
                affiliationSignature: signature,
                meta: {},
            }

            api.requestConcrntApi(
                host,
                'net.concrnt.world.register',
                {},
                {
                    method: 'POST',
                    body: JSON.stringify(request),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            ).then(() => {
                console.log("Registered");
                if (Platform.OS !== 'web') { // expo
                    SecureStore.setItemAsync("identity", JSON.stringify(identity));
                } else { // web
                    localStorage.setItem("identity", JSON.stringify(identity));
                }
                AsyncStorage.setItem("host", host);
                reloadAppAsync();
            })

        }

        init();
    }


    return (
        <SafeAreaView style={styles.container}>
            <Text>Welcome</Text>
            <Button title="Register" onPress={() => register('cc2.tunnel.anthrotech.dev')} />
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 10,
    },
})
