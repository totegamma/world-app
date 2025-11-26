
export interface Document<T> {
    key?: string
    contentType: string
    schema: string
    value: T
    author: string
    owner?: string
    createdAt: Date
}

export interface Proof {
    "type": string
    "signature": string
}

export interface SignedDocument {
    "document": string
    "proof": Proof
}

