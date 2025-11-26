import { Text, StyleSheet, Button, TextInput } from 'react-native';
import { useClient } from '../context/client';
import { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { commit } from '../lib/client';

export default function Tab() {

    const client = useClient();
    const [draft, setDraft] = useState<string>("");

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text>CCID: {client.identity?.CCID}</Text>
                <Text>Registration</Text>
                <Button title="register" onPress={() => client.register?.()} />
                <Text>Message</Text>
                <TextInput
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '100%' }}
                    onChangeText={text => setDraft(text)}
                    value={draft}
                />
                <Button title="Commit Message" onPress={() => {
                    if (!client.identity) return;
                    const document = {
                        schema: "https://schema.concrnt.world/m/markdown.json",
                        value: {
                            "body": draft
                        },
                        author: client.identity.CCID,
                        createdAt: new Date(),
                    };
                    commit('cc2.tunnel.anthrotech.dev', client.identity, document)
                }} />
            </SafeAreaView>
        </SafeAreaProvider>
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
});
