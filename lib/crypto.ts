import { ec as Ec } from 'elliptic'
import { LangJa } from './lang-ja'
import { LangEn, Mnemonic, randomBytes, HDNodeWallet, keccak256 } from 'ethers'
import { toBech32 } from "@cosmjs/encoding";
import { Secp256k1 } from "@cosmjs/crypto";
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";

const HDPath = "m/44'/118'/0'/0/0" // use Cosmos HD path

export interface Identity {
    mnemonic: string
    mnemonic_ja: string
    privateKey: string
    publicKey: string
    CCID: string
}

export const GenerateIdentity = (): Identity => {
    const entrophy = randomBytes(16)
    const mnemonic = Mnemonic.fromEntropy(entrophy, null).phrase
    if (!mnemonic) throw new Error('failed to generate mnemonic')
    const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, HDPath)
    const CCID = computeCCID(wallet.publicKey.slice(2))
    const privateKey = wallet.privateKey.slice(2)
    const publicKey = wallet.publicKey.slice(2)

    const mnemonic_ja = mnemonic_en2ja(mnemonic)

    if (!mnemonic_ja) throw new Error('failed to generate mnemonic')

    return {
        mnemonic,
        mnemonic_ja,
        privateKey,
        publicKey,
        CCID
    }
}

export const LoadIdentity = (mnemonic: string): Identity | null => {
    let normalized = mnemonic.trim().normalize('NFKD')

    const split = normalized.split(' ')
    if (split.length !== 12) {
        return null
    }

    let mnemonic_en = normalized
    let mnemonic_ja = normalized

    if (normalized[0].match(/[a-z]/)) { // english mnemonic
        const converted = mnemonic_en2ja(normalized)
        if (!converted) return null
        mnemonic_ja = converted
    } else { // japanese mnemonic
        const converted = mnemonic_ja2en(normalized)
        if (!converted) return null
        mnemonic_en = converted
    }

    const wallet = HDNodeWallet.fromPhrase(mnemonic_en, undefined, HDPath)
    const privateKey = wallet.privateKey.slice(2)
    const publicKey = wallet.publicKey.slice(2)

    const CCID = computeCCID(publicKey)

    return {
        mnemonic: mnemonic_en,
        mnemonic_ja: mnemonic_ja,
        privateKey,
        publicKey,
        CCID,
    }
}

export const Sign = (privatekey: string, payload: string): string => {
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.keyFromPrivate(privatekey)
    const messageHash = keccak256(new TextEncoder().encode(payload)).slice(2)
    const signature = keyPair.sign(messageHash, 'hex', { canonical: true })
    const r = toHexString(signature.r.toArray())
    const s = toHexString(signature.s.toArray())
    const rpad = '0'.repeat(64 - r.length) + r
    const spad = '0'.repeat(64 - s.length) + s
    const v = signature.recoveryParam === 0 ? '00' : '01'
    return rpad + spad + v
}

function parseHexString(hexString: string): Uint8Array {
    return new Uint8Array((hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)))
}

const computeCCID = (publickey: string): string => {
    const bytes = parseHexString(publickey)
    let compressedPubkey = Secp256k1.compressPubkey(bytes)
    let address = toBech32('con', rawSecp256k1PubkeyToRawAddress(compressedPubkey))
    return address
}



const mnemonic_ja2en = (mnemonic_ja: string): string | null => {
    try {
        mnemonic_ja = mnemonic_ja.trim().normalize('NFKD')
        const mnemonic_en = mnemonic_ja.split(' ')
            .map((word) => {
                const wordIndex = LangJa.wordlist().getWordIndex(word)
                return LangEn.wordlist().getWord(wordIndex)
            })
            .join(' ')
        return mnemonic_en
    } catch (error) {
        console.error(error)
        return null
    }
}

const mnemonic_en2ja = (mnemonic_en: string): string | null => {
    try {
        mnemonic_en = mnemonic_en.trim().normalize('NFKD')
        const mnemonic_ja = mnemonic_en.split(' ')
            .map((word) => {
                const wordIndex = LangEn.wordlist().getWordIndex(word)
                return LangJa.wordlist().getWord(wordIndex)
            })
            .join(' ')
        return mnemonic_ja
    } catch (error) {
        console.error(error)
        return null
    }
}

function toHexString(byteArray: Uint8Array | number[]): string {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
}

