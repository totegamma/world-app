import { Text, StyleSheet, Button, TextInput, Modal, View, KeyboardAvoidingView, Pressable } from 'react-native';
import { useClient } from '../context/client';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commit } from '../lib/client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Tab() {

    const client = useClient();
    const [draft, setDraft] = useState<string>("");

    const [openComposer, setOpenComposer] = useState<boolean>(false);

    return (
        <SafeAreaView style={styles.container}>
            <Text>CCID: {client.identity?.CCID}</Text>

            <Pressable
                onPress={() => setOpenComposer(true)}
                style={{
                    backgroundColor: '#007AFF',
                    padding: 15,
                    borderRadius: '100%',
                    position: 'absolute',
                    bottom: 30,
                    right: 30,
                }}
            >
                <MaterialIcons name="edit" size={24} color="white" />
            </Pressable>

            <Modal
                animationType="slide"
                transparent={false}
                visible={openComposer}
                onRequestClose={() => {
                    setOpenComposer(false);
                }}
            >
                <SafeAreaView style={styles.container}>
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                            width: '100%',
                            gap: 10,
                        }}
                        behavior="padding"
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}
                        >
                            <Button title="Cancel" onPress={() => setOpenComposer(false)} />
                            <Button title="Post" 
                                onPress={() => {
                                    if (!client.identity) return;
                                    const document = {
                                        schema: "https://schema.concrnt.world/m/markdown.json",
                                        value: {
                                            "body": draft
                                        },
                                        author: client.identity.CCID,
                                        memberOf: [
                                            `cc://${client.identity.CCID}/world.concrnt.t-home`,
                                        ],
                                        createdAt: new Date(),
                                    };
                                    commit('cc2.tunnel.anthrotech.dev', client.identity, document).then(() => {
                                        setDraft("");
                                        setOpenComposer(false);
                                    })
                                }}
                            />
                        </View>
                        <TextInput
                            editable
                            multiline
                            autoFocus
                            placeholder="いまどうしてる？"
                            style={{
                                width: '100%',
                                flex: 1,
                                fontSize: 18,
                            }}
                            onChangeText={text => setDraft(text)}
                            value={draft}
                        />
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
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
});
