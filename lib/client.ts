import { Document, Affiliation } from "./model";
import { Identity, Sign } from "./crypto";

export const affiliate = async (identity: Identity, server: string) => {

    const doc: Document<Affiliation> = {
        author: identity.CCID,
        schema: "https://schema.concrnt.net/affiliation.json",
        value: {
            domain: server
        },
        createdAt: new Date(),
    }

    const docString = JSON.stringify(doc)
    const signature = Sign(identity.privateKey, docString)

    const signedDoc = {
        document: docString,
        proof: {
            type: "concrnt-ecrecover-direct",
            signature: signature
        }
    }

    return fetch(`https://${server}/commit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(signedDoc)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        return response.json();
    }).then(data => {
        console.log("Affiliation committed successfully:", data);
    }).catch(error => {
        console.error("Error committing affiliation:", error);
    });
}


