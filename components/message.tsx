import { View, Text, Image, Pressable } from "react-native";
import { useClient } from "../context/client";
import { useEffect, useState } from "react";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface MessageCellProps {
    uri: string;
}

interface MarkdownSchema {
    body: string
}

interface ProfileSchema {
    username: string
    avatar: string
}

class Document<T> {
    value: T = {} as T
}


export const MessageCell = (props: MessageCellProps) => {

    const client = useClient();
    const [updator, setUpdator] = useState<number>(0);
    const [resource, setDocument] = useState<Document<MarkdownSchema>>();
    const [profile, setProfile] = useState<Document<ProfileSchema>>();
    const [associationCounts, setAssociationCounts] = useState<Record<string, number>>();

    useEffect(() => {
        client.api.getResource<Document<MarkdownSchema>>(Document<MarkdownSchema>, props.uri).then(res => {
            setDocument(res);
        })

        const parsed = new URL(props.uri);
        const owner = parsed.hostname;
        const profileUri = `cc://${owner}/world.concrnt.profile`;

        client.api.getResource<Document<ProfileSchema>>(Document<ProfileSchema>, profileUri).then(res => {
            setProfile(res);
        }).catch(err => {
            console.log("Failed to load profile for ", owner, err);
        })

        client.api.requestConcrntApi(
            'cc2.tunnel.anthrotech.dev',
            'net.concrnt.core.association-counts',
            {
                query: `?uri=${encodeURIComponent(props.uri)}`
            },
            {
                method: 'GET',
            }
        ).then(res => {
            console.log("Association counts", res);
            setAssociationCounts(res as Record<string, number>);
        }).catch(err => {
            console.log("Failed to load association counts", err);
        })


    }, [client, props.uri, updator]);

    return (
        <View 
            style={{ 
                width: '100%',
                flexDirection: 'row',
                gap: 10,
            }}
        >
            <Image
                source={{
                    uri: profile ? profile.value.avatar : undefined
                }}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 5
                }}
            />
            <View
                style={{ 
                    flex: 1,
                    display: 'flex',
                }}
            >
                <Text style={{ fontWeight: 'bold'}}>
                    {profile ? profile.value.username : "Loading profile..."}
                </Text>
                <Text>
                    {resource ? resource.value.body : "Loading " + props.uri}
                </Text>
                <Text style={{ color: 'gray', fontSize: 12, marginTop: 3 }}>
                    {props.uri}
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        gap: 15,
                        marginTop: 5,
                    }}
                >
                    <Pressable
                        onPress={() => {
                            const parsed = new URL(props.uri);
                            const owner = parsed.hostname;

                            const document = {
                                schema: "https://schema.concrnt.world/a/like.json",
                                value: {},
                                author: client.ccid,
                                owner: owner,
                                associate: props.uri,
                                createdAt: new Date(),
                            }
                            client.api.commit(document).then(() => {
                                console.log("Liked!")
                                setUpdator((prev) => prev + 1);
                            })
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                    >
                        <MaterialIcons name="star-border" size={20} color="gray" />
                        <Text style={{ fontSize: 12, color: 'gray' }}>
                            {associationCounts && associationCounts['https://schema.concrnt.world/a/like.json'] ? associationCounts['https://schema.concrnt.world/a/like.json'] : ' '}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )

}


