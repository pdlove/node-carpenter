import zlib from 'zlib'; // only if you re-use gzip elsewhere
import net from 'node:net';

// ---------- Binary <-> string helpers ----------
function parseIPv4(str) {
  const parts = str.split('.');
  if (parts.length !== 4) return null;
  const bytes = parts.map(x => {
    const n = Number(x);
    return Number.isInteger(n) && n >= 0 && n <= 255 ? n : NaN;
  });
  if (bytes.some(Number.isNaN)) return null;
  return Buffer.from(bytes);
}

// Expand an IPv6 string (supports :: compression & v4-mapped tail) into 16 bytes
function parseIPv6(str) {
  // IPv4-mapped tail?
  const v4tail = str.includes('.') ? parseIPv4(str.split(':').pop()) : null;

  let head = str, tail = '';
  const dbl = str.indexOf('::');
  if (dbl !== -1) {
    head = str.slice(0, dbl);
    tail = str.slice(dbl + 2);
  }

  const headParts = head ? head.split(':').filter(Boolean) : [];
  const tailParts = tail ? tail.split(':').filter(Boolean) : [];

  // If IPv4 tail, it replaces the last two 16-bit groups
  const totalGroups = v4tail ? 6 : 8;
  const fill = totalGroups - (headParts.length + tailParts.length);
  if (fill < 0) return null;

  const groups = [
    ...headParts,
    ...Array.from({ length: fill }, () => '0'),
    ...tailParts
  ];

  // Convert to 16 bytes
  const bytes = Buffer.alloc(16);
  let idx = 0;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const n = parseInt(g || '0', 16);
    if (Number.isNaN(n) || n < 0 || n > 0xFFFF) return null;
    bytes[idx++] = (n >> 8) & 0xFF;
    bytes[idx++] = n & 0xFF;
  }

  if (v4tail) {
    // overwrite last two groups with IPv4 bytes
    bytes[12] = v4tail[0];
    bytes[13] = v4tail[1];
    bytes[14] = v4tail[2];
    bytes[15] = v4tail[3];
  }

  return bytes;
}

function ipTo16(ipStr) {
  const kind = net.isIP(ipStr);
  if (kind === 4) {
    const v4 = parseIPv4(ipStr);
    if (!v4) return null;
    // IPv4-mapped IPv6 ::ffff:a.b.c.d
    const buf = Buffer.alloc(16);
    buf.fill(0, 0, 10);
    buf[10] = 0xFF;
    buf[11] = 0xFF;
    v4.copy(buf, 12);
    return buf;
  }
  if (kind === 6) return parseIPv6(ipStr);
  return null;
}

function ipFrom16(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (b.length !== 16) return null;
  // Detect IPv4-mapped
  const v4mapped =
    b.slice(0, 10).every(x => x === 0) && b[10] === 0xFF && b[11] === 0xFF;
  if (v4mapped) return `${b[12]}.${b[13]}.${b[14]}.${b[15]}`;

  // format compact IPv6 (simple, not full RFC 5952 perfection, but decent)
  const groups = [];
  for (let i = 0; i < 16; i += 2) {
    groups.push(((b[i] << 8) | b[i + 1]).toString(16));
  }
  // collapse the longest run of zeros
  let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i, curLen = 1; else curLen++;
      if (curLen > bestLen) bestLen = curLen, bestStart = curStart;
    } else {
      curStart = -1; curLen = 0;
    }
  }
  if (bestLen > 1) {
    const collapsed = [
      ...groups.slice(0, bestStart),
      '',
      ...groups.slice(bestStart + bestLen)
    ];
    // ensure leading/trailing ::
    if (bestStart === 0) collapsed.unshift('');
    if (bestStart + bestLen === 8) collapsed.push('');
    return collapsed.join(':').replace(/:{3,}/, '::');
  }
  return groups.join(':');
}

function parseMac(str, expectedBytes) {
  // Accept 00:11:22:33:44:55, 0011.2233.4455, 00-11-22-33-44-55, 001122334455
  const hex = str.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  const needed = expectedBytes * 2;
  if (hex.length !== needed) return null;
  const buf = Buffer.alloc(expectedBytes);
  for (let i = 0; i < expectedBytes; i++) {
    buf[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

function macToString(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return Array.from(b).map(n => n.toString(16).padStart(2, '0')).join(':');
}

// Generic helper to attach binary-backed string accessors
function attachBinaryString(field, fieldName, blobLen, toBuf, fromBuf) {
  field.type = blobLen ? DataTypes.BLOB(blobLen) : DataTypes.BLOB;
  field.get = function () {
    const raw = this.getDataValue(fieldName);
    if (raw == null) return null;
    return fromBuf(raw);
  };
  field.set = function (val) {
    if (val == null) return this.setDataValue(fieldName, null);
    const buf = toBuf(String(val));
    if (!buf) throw new Error(`Invalid value for ${fieldName}: ${val}`);
    this.setDataValue(fieldName, buf);
  };
}
