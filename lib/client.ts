import { Document, Affiliation } from "./model";
import { Identity, Sign } from "./crypto";

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export const getResource = async (server: string, uri: string) => {
    const fetchURL = `https://${server}/resource/${encodeURIComponent(uri)}`;

    return fetch(fetchURL)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new NotFoundError(`Resource not found: ${uri}`);
                }
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data as Document<any>;
        })
        .catch(error => {
            console.error("Error fetching resource:", error);
            throw error;
        });
};


export const commit = async (server: string, identity: Identity, document: Document<any>) => {

    const docString = JSON.stringify(document)
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


