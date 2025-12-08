import { View, Text } from "react-native";
import { useClient } from "../context/client";
import { useEffect, useState } from "react";


export interface MessageCellProps {
    uri: string;
}

class Resource {
    body: string = "";
}

export const MessageCell = (props: MessageCellProps) => {

    const client = useClient();
    const [resource, setResource] = useState<Resource>();

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const res = await client.api.getResource(Resource, props.uri);
                setResource(res);
            } catch (error) {
                console.error("Failed to fetch resource:", error);
            }
        }
        fetchResource();
    }, [client, props.uri]);

    return (
        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', width: '100%' }}>
            <Text>{resource ? resource.body : "Loading " + props.uri}</Text>
        </View>
    )

}


