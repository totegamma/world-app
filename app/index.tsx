import { Text, StyleSheet, Button, TextInput, Modal, View, KeyboardAvoidingView, Pressable } from 'react-native';
import { useClient } from '../context/client';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ChunklineItem } from '@concrnt/client';
import { MessageCell } from '../components/message';

export default function Tab() {

    const client = useClient();
    const [draft, setDraft] = useState<string>("");

    const [openComposer, setOpenComposer] = useState<boolean>(false);

    const [posts, setPosts] = useState<ChunklineItem[]>([]);

    const fetchPosts = async () => {
        const response = await fetch(`http://cc2.tunnel.anthrotech.dev/api/v1/timeline/recent?uris=cc://${client.ccid}/world.concrnt.t-home`);
        const data = await response.json();
        console.log(data);
        if (!data) return;
        setPosts(data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text>CCID: {client.ccid}</Text>

            {posts.map((item, index) => (
                <MessageCell key={index} uri={item.href} />
            ))}

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
                                    const document = {
                                        schema: "https://schema.concrnt.world/m/markdown.json",
                                        value: {
                                            "body": draft
                                        },
                                        author: client.ccid,
                                        memberOf: [
                                            `cc://${client.ccid}/world.concrnt.t-home`,
                                        ],
                                        createdAt: new Date(),
                                    };
                                    client.api.commit(document).then(() => {
                                        setDraft("");
                                        setOpenComposer(false);
                                        fetchPosts();
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
