import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { GenerateIdentity, Identity } from '../lib/crypto';
import { Text } from "react-native";
import { affiliate, commit, getResource, NotFoundError } from "../lib/client";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";


type ClientContextValue = {
    identity?: Identity,
    register?: () => void,
    logout?: () => void,
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

type ClientProviderProps = {
    children: ReactNode;
};

export const ClientProvider = (props: ClientProviderProps): ReactNode => {

    const [identity, setIdentity] = useState<Identity>();

    useEffect(() => {
        let init = async () => {
            if (Platform.OS !== 'web') { // expo
                let result = await SecureStore.getItemAsync("subkey");
                if (result) {
                    let parsed: Identity = JSON.parse(result);
                    setIdentity(parsed);
                } else {
                    let newIdentity = GenerateIdentity();
                    setIdentity(newIdentity);
                    await SecureStore.setItemAsync("subkey", JSON.stringify(newIdentity));
                }
            } else { // web
                let result = localStorage.getItem("subkey");
                if (result) {
                    let parsed: Identity = JSON.parse(result);
                    setIdentity(parsed);
                } else {
                    let newIdentity = GenerateIdentity();
                    setIdentity(newIdentity);
                    localStorage.setItem("subkey", JSON.stringify(newIdentity));
                }
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!identity) return;

        let check = async () => {
            let timeline = await getResource('cc2.tunnel.anthrotech.dev', `cc://${identity.CCID}/world.concrnt.t-home`).catch((err) => {
                if (err instanceof NotFoundError) {

                    const document = {
                        key: "world.concrnt.t-home",
                        author: identity.CCID,
                        schema: "https://schema.concrnt.world/t/empty.json",
                        contentType: "application/chunkline+json",
                        value: {},
                        createdAt: new Date(),
                    }

                    commit('cc2.tunnel.anthrotech.dev', identity, document);

                } else {
                    console.error("Error fetching timeline:", err);
                    return null;
                }

            })
            console.log("Fetched timeline:", timeline);
        }

        check();
    }, [identity]);

    const register = useCallback(() => {
        if (!identity) return;
        affiliate(identity, 'cc2.tunnel.anthrotech.dev');
    }, [identity]);

    const logout = useCallback(async () => {
        if (Platform.OS !== 'web') {
            SecureStore.deleteItemAsync("subkey").then(() => {
                setIdentity(undefined);
            })
        } else {
            localStorage.removeItem("subkey");
            setIdentity(undefined);
        }
    }, []);

    const value = useMemo(() => ({
        identity,
        register,
        logout
    }), [identity, register, logout]);

    if (!identity) {
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
