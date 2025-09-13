export const asn1Types = {
    EOC: 0x00,
    Boolean: 0x01,
    Integer: 0x02,
    BitString: 0x03,
    OctetString: 0x04,
    Null: 0x05,
    OID: 0x06,
    ObjectDescriptor: 0x07,
    External: 0x08,
    Real: 0x09, // float
    Enumeration: 0x0A,
    PDV: 0x0B,
    Utf8String: 0x0C,
    RelativeOID: 0x0D,
    Sequence: 0x10,
    Set: 0x11,
    NumericString: 0x12,
    PrintableString: 0x13,
    T61String: 0x14,
    VideotexString: 0x15,
    IA5String: 0x16,
    UTCTime: 0x17,
    GeneralizedTime: 0x18,
    GraphicString: 0x19,
    VisibleString: 0x1A,
    GeneralString: 0x1C,
    UniversalString: 0x1D,
    CharacterString: 0x1E,
    BMPString: 0x1F,
    Constructor: 0x20,
    Context: 0x80
};

for (var key in asn1Types)
    asn1Types[asn1Types[key]] = key;

export function addASN1Type(typeNumber, typeName) {
    asn1Types[typeNumber] = typeName;
    asn1Types[typeName] = typeNumber;
}

export function buildBER(jsonNode) {
    return encodeNode(jsonNode);
}

export function parseBER(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError("parseBER expects a Node.js Buffer.");
    }
    const { node, offset } = readNode(buffer, 0);
    if (offset !== buffer.length) {
        // Multiple top-level TLVs? Return them all for safety.
        const nodes = [node];
        let off = offset;
        while (off < buffer.length) {
            const r = readNode(buffer, off);
            nodes.push(r.node);
            off = r.offset;
        }
        return nodes.length === 1 ? nodes[0] : nodes;
    }
    return node;
}

function readNode(buf, offset) {
    const start = offset;
    // --- Identifier octets ---
    let id = buf[offset++];
    if (id === undefined) throw new Error("Unexpected end of buffer (identifier).");

    const clsBits = (id & 0b11000000) >>> 6;
    const constructed = (id & 0b00100000) !== 0;
    let tag = id & 0b00011111;

    if (tag === 0x1f) {
        // high-tag-number form: base-128 big-endian, msb=continuation
        tag = 0;
        let b;
        do {
            b = buf[offset++];
            if (b === undefined) throw new Error("Unexpected end of buffer (tag).");
            tag = (tag << 7) | (b & 0x7f);
        } while (b & 0x80);
    }

    // --- Length octets ---
    let length = buf[offset++];
    if (length === undefined) throw new Error("Unexpected end of buffer (length).");
    let indefinite = false;

    if (length & 0x80) {
        const n = length & 0x7f;
        if (n === 0) {
            // Indefinite length
            indefinite = true;
            length = -1;
        } else {
            if (offset + n > buf.length) throw new Error("Length extends beyond buffer.");
            length = 0;
            for (let i = 0; i < n; i++) {
                length = (length << 8) | buf[offset + i];
            }
            offset += n;
        }
    }

    // --- Content ---
    let value, nextOffset;

    if (constructed) {
        if (indefinite) {
            const children = [];
            let off = offset;
            while (true) {
                if (off + 1 <= buf.length && buf[off] === 0x00 && buf[off + 1] === 0x00) {
                    off += 2; // EOC
                    nextOffset = off;
                    break;
                }
                const r = readNode(buf, off);
                children.push(r.node);
                off = r.offset;
                if (off > buf.length) throw new Error("Constructed value overruns buffer.");
            }
            value = children;
        } else {
            const end = offset + length;
            if (end > buf.length) throw new Error("Content length overruns buffer.");
            const children = [];
            let off = offset;
            while (off < end) {
                const r = readNode(buf, off);
                children.push(r.node);
                off = r.offset;
            }
            value = children;
            nextOffset = end;
        }
    } else {
        // primitive
        let content, end;
        if (indefinite) {
            // strictly illegal for primitive in BER, but be liberal: read until EOC 00 00
            let off = offset;
            const chunks = [];
            while (true) {
                if (off + 1 <= buf.length && buf[off] === 0x00 && buf[off + 1] === 0x00) {
                    off += 2;
                    end = off;
                    break;
                }
                // Treat as nested TLV fragments (primitive chunk)
                // In practice, most encoders won't do this. Fallback: consume bytes until EOC.
                chunks.push(buf[off]);
                off += 1;
                if (off > buf.length) throw new Error("Primitive indefinite overruns buffer.");
            }
            content = Buffer.from(chunks);
            nextOffset = end;
        } else {
            end = offset + length;
            if (end > buf.length) throw new Error("Content length overruns buffer.");
            content = buf.subarray(offset, end);
            nextOffset = end;
        }
        value = decodePrimitive(tag, clsBits, content);
    }

    const node = (isConstructedUniversalSequenceOrSet(clsBits, tag, constructed))
        ? { tag, tagName: asn1Types[tag], value } // array already
        : { tag, tagName: asn1Types[tag], value };

    return { node, offset: nextOffset ?? offset };
}

// Helpers

function isConstructedUniversalSequenceOrSet(clsBits, tag, constructed) {
    return clsBits === 0 /* UNIVERSAL */ && constructed && (tag === 16 || tag === 17);
}

function decodePrimitive(tag, clsBits, bytes) {
    // Only try to decode UNIVERSAL class; otherwise return hex.
    if (clsBits !== 0) return toHex(bytes);

    switch (tag) {
        case 1:  // BOOLEAN
            return bytes.length ? bytes[0] !== 0x00 : false;
        case 2:  // INTEGER
            return decodeInteger(bytes);
        case 3:  // BIT STRING
            return decodeBitString(bytes);
        case 4:  // OCTET STRING
            return toHex(bytes);
        case 5:  // NULL
            return null;
        case 6:  // OBJECT IDENTIFIER
            return decodeOID(bytes);
        case 12: // UTF8String
            return bytes.toString("utf8");
        case 19: // PrintableString
            return bytes.toString("ascii");
        case 22: // IA5String
            return bytes.toString("ascii");
        case 23: // UTCTime (YYMMDDhhmm[ss]Z or offset)
            return decodeTimeString(bytes.toString("ascii"), true);
        case 24: // GeneralizedTime (YYYYMMDDhhmmss[.fff]Z or offset)
            return decodeTimeString(bytes.toString("ascii"), false);
        default:
            // Unknown/unsupported universal primitive => hex
            return toHex(bytes);
    }
}

function decodeInteger(bytes) {
    if (bytes.length === 0) return 0n;
    let x = 0n;
    for (const b of bytes) x = (x << 8n) | BigInt(b);
    // two's complement if MSB set
    if (bytes[0] & 0x80) {
        const bits = 8n * BigInt(bytes.length);
        x = x - (1n << bits);
    }
    // If small enough, return Number; else BigInt (keeps precision).
    const minSafe = BigInt(Number.MIN_SAFE_INTEGER);
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    if (x >= minSafe && x <= maxSafe) return Number(x);
    return x;
}

function decodeBitString(bytes) {
    if (bytes.length === 0) return { unusedBits: 0, bytes: "" };
    const unusedBits = bytes[0];
    const data = bytes.subarray(1);
    return { unusedBits, bytes: toHex(data) };
}

function decodeOID(bytes) {
    if (bytes.length === 0) return "";
    const first = bytes[0];
    const firstArc = Math.floor(first / 40);
    const secondArc = first % 40;
    const arcs = [firstArc, secondArc];

    let value = 0n;
    for (let i = 1; i < bytes.length; i++) {
        const b = bytes[i];
        value = (value << 7n) | BigInt(b & 0x7f);
        if ((b & 0x80) === 0) {
            arcs.push(Number(value));
            value = 0n;
        }
    }
    return arcs.join(".");
}

function decodeTimeString(s, isUTC) {
    // extremely light parser: returns ISO-like string if Z or offset present; else raw.
    // e.g. "230101120000Z" -> "2023-01-01T12:00:00Z"
    try {
        if (isUTC) {
            // UTCTime: YYMMDDhhmm[ss]Z or with offset. We'll coerce 1950..2049 window.
            const m = s.match(
                /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?((?:Z)|(?:[+\-]\d{4}))$/
            );
            if (!m) return s;
            const yy = Number(m[1]);
            const year = yy >= 50 ? 1900 + yy : 2000 + yy;
            const [MM, DD, hh, mm, ss] = [m[2], m[3], m[4], m[5], m[6] ?? "00"].map(Number);
            const tz = m[7];
            const base = `${pad(year, 4)}-${pad(MM)}-${pad(DD)}T${pad(hh)}:${pad(mm)}:${pad(ss)}`;
            return tz === "Z" ? `${base}Z` : toISOWithOffset(base, tz);
        } else {
            // GeneralizedTime: YYYYMMDDhhmmss(.fff)?Z or offset
            const m = s.match(
                /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.(\d+))?((?:Z)|(?:[+\-]\d{4}))$/
            );
            if (!m) return s;
            const [YYYY, MM, DD, hh, mm, ss] = m.slice(1, 7).map(Number);
            const frac = m[7] ? `.${m[7]}` : "";
            const tz = m[8];
            const base = `${pad(YYYY, 4)}-${pad(MM)}-${pad(DD)}T${pad(hh)}:${pad(mm)}:${pad(ss)}${frac}`;
            return tz === "Z" ? `${base}Z` : toISOWithOffset(base, tz);
        }
    } catch {
        return s; // if anything goes sideways, just return the raw string
    }
}

function toISOWithOffset(base, tz) {
    // tz like "+hhmm" or "-hhmm"
    const sign = tz[0] === "-" ? "-" : "+";
    const hh = tz.slice(1, 3);
    const mm = tz.slice(3, 5);
    return `${base}${sign}${hh}:${mm}`;
}

function pad(n, width = 2) {
    const s = String(n);
    return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

function toHex(bytes) {
    return bytes.toString("hex");
}


// ---- Core ----

function encodeNode(node) {
    if (!node || typeof node !== "object") {
        throw new TypeError("encodeNode expects an object { tag, value }.");
    }
    const { tag, value } = node;

    // Shortcut: if tag looks like a *full identifier octet* (e.g., 0xA0, 0xA2, 0x41) and is low-tag-number form,
    // we'll use it directly. This is perfect for SNMP PDUs and Counter32.
    if (Number.isInteger(tag) && tag >= 0x80 && tag <= 0xFF && (tag & 0x1f) !== 0x1f) {
        const idOctet = Buffer.from([tag]);
        const content =
            Array.isArray(value) ? Buffer.concat(value.map(encodeNode))
                : encodePrimitiveFallback(tag, value);
        return Buffer.concat([idOctet, encodeLength(content.length), content]);
    }

    // Otherwise, we assume UNIVERSAL class (cls=0) with a plain tag number (e.g., 2,4,5,6,16,17).
    if (!Number.isInteger(tag) || tag < 0) {
        throw new TypeError("Invalid tag.");
    }

    const constructed = (tag === 16 || tag === 17) || Array.isArray(value);

    const id = encodeIdentifier(/*cls=*/0, constructed, /*tagNumber=*/tag);
    let content;

    if (constructed) {
        if (!Array.isArray(value)) {
            throw new TypeError(`Tag ${tag} is constructed but value is not an array.`);
        }
        content = Buffer.concat(value.map(encodeNode));
    } else {
        content = encodeUniversalPrimitive(tag, value);
    }

    return Buffer.concat([id, encodeLength(content.length), content]);
}

// ---- Identifier / Length ----

function encodeIdentifier(clsBits, constructed, tagNumber) {
    // clsBits: 0=UNIVERSAL, 1=APPLICATION, 2=CONTEXT, 3=PRIVATE
    let firstOctet = (clsBits & 0b11) << 6;
    if (constructed) firstOctet |= 0b00100000;
    if (tagNumber < 31) {
        firstOctet |= (tagNumber & 0x1f);
        return Buffer.from([firstOctet]);
    }
    // High-tag-number form
    firstOctet |= 0x1f;
    const tagBytes = [];
    let n = tagNumber >>> 0;
    const stack = [];
    do {
        stack.push(n & 0x7f);
        n = Math.floor(n / 128);
    } while (n > 0);
    for (let i = stack.length - 1; i >= 0; i--) {
        const b = stack[i] | (i === 0 ? 0x00 : 0x80);
        tagBytes.push(b);
    }
    return Buffer.from([firstOctet, ...tagBytes]);
}

function encodeLength(len) {
    if (len < 0x80) return Buffer.from([len]);
    const bytes = [];
    let n = len >>> 0;
    while (n > 0) {
        bytes.push(n & 0xff);
        n >>>= 8;
    }
    bytes.reverse();
    return Buffer.from([0x80 | bytes.length, ...bytes]);
}

// ---- UNIVERSAL primitives ----

function encodeUniversalPrimitive(tag, value) {
    switch (tag) {
        case 1: { // BOOLEAN
            const b = value ? 0xff : 0x00;
            return Buffer.from([b]);
        }
        case 2: { // INTEGER
            return encodeInteger(value);
        }
        case 3: { // BIT STRING
            if (value && typeof value === "object" && Number.isInteger(value.unusedBits)) {
                const data = hexToBuf(value.bytes || "");
                return Buffer.from([value.unusedBits, ...data]);
            }
            throw new TypeError("BIT STRING expects { unusedBits, bytes: <hex> }.");
        }
        case 4: { // OCTET STRING
            // Accept string -> UTF-8; or {hex:"..."} for explicit binary
            if (typeof value === "string") return Buffer.from(value, "utf8");
            if (value && typeof value === "object" && typeof value.hex === "string") {
                return hexToBuf(value.hex);
            }
            throw new TypeError('OCTET STRING expects a string or {hex:"..."}');
        }
        case 5: { // NULL
            return Buffer.alloc(0);
        }
        case 6: { // OBJECT IDENTIFIER
            if (typeof value !== "string") throw new TypeError("OID expects dotted string.");
            return encodeOID(value);
        }
        case 12: // UTF8String
        case 19: // PrintableString
        case 22: // IA5String
            if (typeof value !== "string") throw new TypeError("String type expects string.");
            // (We won't try to validate PrintableString/IA5 charset here.)
            return Buffer.from(value, tag === 12 ? "utf8" : "ascii");
        default:
            throw new Error(`Unsupported UNIVERSAL primitive tag ${tag}.`);
    }
}

// Fallback for when caller supplied a non-UNIVERSAL single-octet identifier (e.g., 0x41 Counter32)
function encodePrimitiveFallback(idOctet, value) {
    // We only need a couple for SNMP demos:
    //  - 0x41: [APPLICATION 1] Counter32 -> non-negative integer
    //  - 0x44: [APPLICATION 4] IpAddress (string "x.x.x.x") (not used here)
    //  - 0xA0/0xA2 etc. are constructed and handled above (Array.isArray)
    const tagLow = idOctet & 0x1f;
    const cls = (idOctet & 0b11000000) >> 6;
    const constructed = !!(idOctet & 0x20);

    if (constructed) {
        if (!Array.isArray(value)) throw new TypeError("Constructed id expects array value.");
        return Buffer.concat(value.map(encodeNode));
    }

    // Primitive application types
    if (cls === 1 /* APPLICATION */ && tagLow === 1 /* Counter32 */) {
        return encodeInteger(value, /*forceUnsigned*/ true);
    }

    // Generic escape hatch: if value is {hex:"..."} or Buffer, emit raw bytes
    if (value && typeof value === "object" && typeof value.hex === "string") {
        return hexToBuf(value.hex);
    }
    if (Buffer.isBuffer(value)) return value;

    // As a sane default, treat string as OCTET STRING payload
    if (typeof value === "string") return Buffer.from(value, "utf8");

    throw new Error(`No fallback encoder for identifier 0x${idOctet.toString(16)}.`);
}

// ---- Helpers ----

function encodeInteger(n, forceUnsigned = false) {
    // Accept Number or BigInt
    let x = typeof n === "bigint" ? n : BigInt(n);
    if (forceUnsigned && x < 0n) throw new RangeError("Unsigned integer cannot be negative.");

    // Emit two's complement, minimal length.
    const bytes = [];
    let negative = x < 0n;

    if (x === 0n) {
        return Buffer.from([0x00]);
    }

    if (negative) {
        // For negative: compute minimal two's complement
        // Find minimal width: while x < min for width, extend
        // Simpler: repeatedly prepend until MSB reflects sign
        // We'll build using infinite-precision, then trim.
        // Convert positive magnitude first:
        let mag = -x - 1n; // one's complement helper
        while (mag !== 0n) {
            bytes.push(Number((mag & 0xffn) ^ 0xffn)); // invert when pushing
            mag >>= 8n;
        }
        // Ensure top byte has sign bit set
        if (bytes.length === 0 || (bytes[bytes.length - 1] & 0x80) === 0) {
            bytes.push(0xff);
        }
        bytes.reverse();
        return Buffer.from(bytes);
    } else {
        while (x > 0n) {
            bytes.push(Number(x & 0xffn));
            x >>= 8n;
        }
        bytes.reverse();
        // If MSB would imply negative, add a leading 0x00
        if (bytes[0] & 0x80) bytes.unshift(0x00);
        return Buffer.from(bytes);
    }
}

function encodeOID(dot) {
    const arcs = dot.split(".").map(s => {
        const n = Number(s);
        if (!Number.isInteger(n) || n < 0) throw new TypeError(`Invalid OID arc "${s}"`);
        return n;
    });
    if (arcs.length < 2) throw new TypeError("OID must have at least two arcs.");
    const first = arcs[0];
    const second = arcs[1];
    if (first > 2) throw new RangeError("OID first arc must be 0..2");
    if (second > 39 && first < 2) throw new RangeError("OID second arc must be 0..39 when first<2");

    const out = [];
    out.push(40 * first + second);

    for (let i = 2; i < arcs.length; i++) {
        let v = BigInt(arcs[i]);
        // base-128, msb=continuation
        const stack = [];
        do {
            stack.push(Number(v & 0x7fn));
            v >>= 7n;
        } while (v > 0n);
        for (let j = stack.length - 1; j >= 0; j--) {
            out.push(stack[j] | (j === 0 ? 0x00 : 0x80));
        }
    }
    return Buffer.from(out);
}

function hexToBuf(hex) {
    const s = hex.replace(/\s+/g, "").toLowerCase();
    if (s.length % 2) throw new TypeError("Hex string length must be even.");
    return Buffer.from(s, "hex");
}
