// Module-level state — shared across the browser session
let _privateKey: CryptoKey | null = null
let _currentUserId: string | null = null

const _peerPublicKeyCache = new Map<string, CryptoKey>()
const _sharedAesKeyCache = new Map<string, CryptoKey>()
const _groupKeyCache = new Map<string, CryptoKey>()
const _groupKeyInFlight = new Map<string, Promise<CryptoKey>>()

// --- IndexedDB helpers ---

function openDB(userId: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(`e2e_${userId}`, 1)
        req.onupgradeneeded = (e) => {
            (e.target as IDBOpenDBRequest).result.createObjectStore('keys')
        }
        req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
        req.onerror = () => reject(req.error)
    })
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
        const req = db.transaction('keys', 'readonly').objectStore('keys').get(key)
        req.onsuccess = () => resolve((req.result as T) ?? null)
        req.onerror = () => reject(req.error)
    })
}

function idbPut(db: IDBDatabase, key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('keys', 'readwrite')
        tx.objectStore('keys').put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

// --- Base64 helpers ---

function bufToBase64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuf(b64: string): ArrayBuffer {
    const binary = atob(b64)
    const buf = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
    return buf.buffer
}

// --- ECDH shared secret → AES-GCM key ---

async function deriveAesKey(privateKey: CryptoKey, peerPublicKey: CryptoKey): Promise<CryptoKey> {
    const bits = await crypto.subtle.deriveBits(
        { name: 'ECDH', public: peerPublicKey },
        privateKey,
        256
    )
    return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

// --- Composable ---

export function useCrypto() {
    /**
     * Called once after login. Generates (or loads from IndexedDB) the user's ECDH P-256
     * key pair and uploads the public key to the server.
     */
    async function initKeys(userId: string): Promise<void> {
        if (_currentUserId === userId && _privateKey) return

        const db = await openDB(userId)
        let privateKey = await idbGet<CryptoKey>(db, 'privateKey')
        let publicKeyJwk = await idbGet<string>(db, 'publicKeyJwk')

        if (!privateKey || !publicKeyJwk) {
            const keyPair = await crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: 'P-256' },
                false, // private key is NOT extractable
                ['deriveKey', 'deriveBits']
            )
            const jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
            publicKeyJwk = JSON.stringify(jwk)
            await idbPut(db, 'privateKey', keyPair.privateKey)
            await idbPut(db, 'publicKeyJwk', publicKeyJwk)
            privateKey = keyPair.privateKey
        }

        // Re-upload public key every login (idempotent — ensures server has it)
        await useMyAuthFetch('user/public-key', { method: 'PUT', body: { publicKey: publicKeyJwk } })

        _privateKey = privateKey
        _currentUserId = userId
    }

    /**
     * Fetches and imports a peer's public key from the server (cached in memory).
     */
    async function getPeerPublicKey(userId: string): Promise<CryptoKey> {
        if (_peerPublicKeyCache.has(userId)) return _peerPublicKeyCache.get(userId)!
        const res = await useMyAuthFetch(`user/${userId}/public-key`) as { publicKey: string }
        const key = await crypto.subtle.importKey(
            'jwk',
            JSON.parse(res.publicKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        )
        _peerPublicKeyCache.set(userId, key)
        return key
    }

    /**
     * Derives (and caches) the shared AES-GCM key for a 1:1 conversation with peerId.
     */
    async function getSharedAesKey(peerId: string): Promise<CryptoKey> {
        if (!_privateKey) throw new Error('E2E keys not initialized. Please log in again.')
        if (_sharedAesKeyCache.has(peerId)) return _sharedAesKeyCache.get(peerId)!
        const peerKey = await getPeerPublicKey(peerId)
        const aesKey = await deriveAesKey(_privateKey, peerKey)
        _sharedAesKeyCache.set(peerId, aesKey)
        return aesKey
    }

    // --- 1:1 message encryption/decryption ---

    async function encryptMessage(text: string, peerId: string): Promise<{ ciphertext: string; iv: string }> {
        // Always fetch fresh keys before sending — the peer may have rotated their key pair
        // (e.g. logged in from a new browser) since we last cached.
        _peerPublicKeyCache.delete(peerId)
        _sharedAesKeyCache.delete(peerId)
        const aesKey = await getSharedAesKey(peerId)
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            aesKey,
            new TextEncoder().encode(text)
        )
        return { ciphertext: bufToBase64(ciphertext), iv: bufToBase64(iv.buffer) }
    }

    async function decryptMessage(ciphertext: string, iv: string, peerId: string): Promise<string> {
        const aesKey = await getSharedAesKey(peerId)
        const plainBuf = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToBuf(iv) },
            aesKey,
            base64ToBuf(ciphertext)
        )
        return new TextDecoder().decode(plainBuf)
    }

    // --- Group key management (ECIES) ---

    /** Generates a fresh AES-256-GCM group key. */
    async function generateGroupKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
    }

    /**
     * Wraps the group key for one member using ECIES:
     * ephemeral ECDH key pair → shared secret → AES-GCM encrypt raw group key bytes.
     */
    async function wrapGroupKeyForMember(
        groupKey: CryptoKey,
        memberPublicKey: CryptoKey
    ): Promise<{ encryptedKey: string; iv: string; ephemeralPublicKey: string }> {
        const ephemeral = await crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveBits']
        )
        const sharedAes = await deriveAesKey(ephemeral.privateKey, memberPublicKey)
        const rawGroupKey = await crypto.subtle.exportKey('raw', groupKey)
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const encryptedKey = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedAes, rawGroupKey)
        const ephemeralJwk = await crypto.subtle.exportKey('jwk', ephemeral.publicKey)
        return {
            encryptedKey: bufToBase64(encryptedKey),
            iv: bufToBase64(iv.buffer),
            ephemeralPublicKey: JSON.stringify(ephemeralJwk)
        }
    }

    /**
     * Unwraps a group key for the current user using ECIES.
     */
    async function unwrapGroupKey(
        encryptedKey: string,
        iv: string,
        ephemeralPublicKeyJwk: string
    ): Promise<CryptoKey> {
        try {
            if (!_privateKey) throw new Error('E2E keys not initialized. Please log in again.')
            const ephemeralPub = await crypto.subtle.importKey(
                'jwk',
                JSON.parse(ephemeralPublicKeyJwk),
                { name: 'ECDH', namedCurve: 'P-256' },
                true,
                []
            )
            const sharedAes = await deriveAesKey(_privateKey, ephemeralPub)
            const rawGroupKey = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: base64ToBuf(iv) },
                sharedAes,
                base64ToBuf(encryptedKey)
            )
            return crypto.subtle.importKey('raw', rawGroupKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
        } catch (err) {
            console.error('[useCrypto] unwrapGroupKey error:', err)
            throw err
        }
    }

    /**
     * Fetches and unwraps the current group key from the server (cached per session).
     * Concurrent calls for the same chatId share one in-flight fetch.
     * Throws if the key is missing or cannot be unwrapped — callers decide how to recover.
     */
    async function getGroupKey(chatId: string): Promise<CryptoKey> {
        if (_groupKeyCache.has(chatId)) return _groupKeyCache.get(chatId)!
        if (_groupKeyInFlight.has(chatId)) return _groupKeyInFlight.get(chatId)!

        const promise = (async (): Promise<CryptoKey> => {
            const entry = await useMyAuthFetch(`chat/${chatId}/group-key`) as {
                encryptedKey: string; iv: string; ephemeralPublicKey: string
            } | null
            if (!entry) throw new Error('No group key found.')
            const groupKey = await unwrapGroupKey(entry.encryptedKey, entry.iv, entry.ephemeralPublicKey)
            _groupKeyCache.set(chatId, groupKey)
            return groupKey
        })().finally(() => _groupKeyInFlight.delete(chatId))

        _groupKeyInFlight.set(chatId, promise)
        return promise
    }

    /**
     * Generates a fresh group key and distributes it to every current member.
     * Only called when encrypting and the existing key can no longer be unwrapped.
     */
    async function redistributeGroupKey(chatId: string): Promise<CryptoKey> {
        const chats = await useMyAuthFetch('chat') as any[]
        const chat = chats?.find((c: any) => c._id === chatId)
        const memberIds: string[] = (chat?.users ?? []).map((u: any) => u._id ?? u).filter(Boolean)
        if (!memberIds.length) throw new Error('Could not retrieve group members to redistribute key.')

        const newGroupKey = await generateGroupKey()
        _peerPublicKeyCache.clear() // force fresh public-key fetches after key rotation
        const results = await Promise.allSettled(
            memberIds.map(async (memberId) => {
                const memberPubKey = await getPeerPublicKey(memberId)
                const wrapped = await wrapGroupKeyForMember(newGroupKey, memberPubKey)
                return { userId: memberId, ...wrapped }
            })
        )
        const keys = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value)
        if (!keys.length) throw new Error('Could not wrap group key for any member.')
        await useMyAuthFetch(`chat/${chatId}/group-key`, { method: 'POST', body: { keys } })
        _groupKeyCache.set(chatId, newGroupKey)
        return newGroupKey
    }

    // --- Group message encryption/decryption ---

    async function encryptGroupMessage(text: string, chatId: string): Promise<{ ciphertext: string; iv: string }> {
        // Always fetch fresh before sending so we pick up any redistribution by other members.
        _groupKeyCache.delete(chatId)

        let groupKey: CryptoKey
        try {
            groupKey = await getGroupKey(chatId)
        } catch {
            // Our private key changed (new browser/device) — redistribute a fresh key now
            // so this and all future members can encrypt/decrypt going forward.
            groupKey = await redistributeGroupKey(chatId)
        }

        const iv = crypto.getRandomValues(new Uint8Array(12))
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            groupKey,
            new TextEncoder().encode(text)
        )
        return { ciphertext: bufToBase64(ciphertext), iv: bufToBase64(iv.buffer) }
    }

    async function decryptGroupMessage(ciphertext: string, iv: string, chatId: string): Promise<string> {
        const tryDecrypt = (key: CryptoKey) => crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToBuf(iv) },
            key,
            base64ToBuf(ciphertext)
        )

        let groupKey: CryptoKey
        try {
            groupKey = await getGroupKey(chatId)
        } catch {
            // Can't unwrap our key entry — our private key changed but we haven't sent a
            // message yet to trigger redistribution. Nothing we can do for existing messages.
            throw new Error('undecryptable')
        }

        try {
            return new TextDecoder().decode(await tryDecrypt(groupKey))
        } catch {
            // Decrypt failed with cached key — another member may have redistributed.
            // Clear cache and retry once with a fresh server fetch.
            _groupKeyCache.delete(chatId)
            try {
                const freshKey = await getGroupKey(chatId)
                return new TextDecoder().decode(await tryDecrypt(freshKey))
            } catch {
                throw new Error('undecryptable')
            }
        }
    }

    /**
     * Deletes the user's IndexedDB key store. Call this on account deletion.
     * After this, decryption of old messages is no longer possible.
     */
    async function deleteKeys(userId: string): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(`e2e_${userId}`)
            req.onsuccess = () => resolve()
            req.onerror = () => reject(req.error)
            req.onblocked = () => resolve() // another tab has it open — proceed anyway
        })
        // Clear in-memory state for this user
        if (_currentUserId === userId) {
            _privateKey = null
            _currentUserId = null
            _peerPublicKeyCache.clear()
            _sharedAesKeyCache.clear()
            _groupKeyCache.clear()
            _groupKeyInFlight.clear()
        }
    }

    return {
        initKeys,
        deleteKeys,
        getPeerPublicKey,
        encryptMessage,
        decryptMessage,
        generateGroupKey,
        wrapGroupKeyForMember,
        redistributeGroupKey,
        getGroupKey,
        encryptGroupMessage,
        decryptGroupMessage
    }
}
