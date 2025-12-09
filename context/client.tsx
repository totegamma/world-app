import 'react-native-get-random-values'
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Text } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";
import { Api, GenerateIdentity, Identity, InMemoryKVS, MasterKeyAuthProvider, NotFoundError } from '@concrnt/client';


type ClientContextValue = {
    ccid: string;
    domain: string;
    api: Api,
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

type ClientProviderProps = {
    children: ReactNode;
};

const host = 'cc2.tunnel.anthrotech.dev';

class Empty {}

export const ClientProvider = (props: ClientProviderProps): ReactNode => {

    const [api, setApi] = useState<Api | undefined>(undefined);

    useEffect(() => {
        let init = async () => {
            let identity: Identity
            if (Platform.OS !== 'web') { // expo
                let result = await SecureStore.getItemAsync("subkey");
                if (result) {
                    let parsed: Identity = JSON.parse(result);
                    identity = parsed;
                } else {
                    let newIdentity = GenerateIdentity();
                    await SecureStore.setItemAsync("subkey", JSON.stringify(newIdentity));
                    identity = newIdentity;
                }
            } else { // web
                let result = localStorage.getItem("subkey");
                if (result) {
                    let parsed: Identity = JSON.parse(result);
                    identity = parsed;
                } else {
                    let newIdentity = GenerateIdentity();
                    localStorage.setItem("subkey", JSON.stringify(newIdentity));
                    identity = newIdentity;
                }
            }

            const authProvider = new MasterKeyAuthProvider(identity.privateKey, host);
            const cacheEngine = new InMemoryKVS();

            const api = new Api(authProvider, cacheEngine)
            setApi(api);

        };
        init();

    }, []);

    useEffect(() => {
        if (!api) return;

        let check = async () => {
            let timeline = await api.getResource(Empty, `cc://${api.authProvider.getCCID()}/world.concrnt.t-home`).catch((err) => {
                if (err instanceof NotFoundError) {
                    const document = {
                        key: "world.concrnt.t-home",
                        author: api.authProvider.getCCID(),
                        schema: "https://schema.concrnt.world/t/empty.json",
                        contentType: "application/chunkline+json",
                        value: {},
                        createdAt: new Date(),
                    }
                    api.commit(document);
                } else {
                    console.error("Error fetching timeline:", err);
                    return null;
                }

            })
            console.log("Fetched timeline:", timeline);
        }

        check();
    }, [api]);

    const value = useMemo(() => ({
        api: api!,
        ccid: api?.authProvider.getCCID()!,
        domain: host,
    }), [api]);

    if (!api) {
        return <Text>Loading...</Text>;
    }

    return (
        <ClientContext.Provider value={value}>
            {props.children}
        </ClientContext.Provider>
    );
};

export const useClient = () => {
    const ctx = useContext(ClientContext);
    if (!ctx) throw new Error("useClient must be used within AuthProvider");
    return ctx;
};
