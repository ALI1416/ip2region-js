/**
 * CRC32
 * @version 2024/08/14 11:11:11
 * @author ALI[ali-k&#64;foxmail.com]
 * @since 1.0.0
 * @see https://github.com/nodeca/pako/blob/master/lib/zlib/crc32.js
 */

/**
 * 生成CRC表
 * @return {number[]} CRC表
 */
function makeTable(): number[] {
  let temp: number, table: number[] = []
  for (let i = 0; i < 256; i++) {
    temp = i
    for (let j = 0; j < 8; j++) {
      temp = (temp & 1) ? (0xEDB88320 ^ (temp >>> 1)) : (temp >>> 1)
    }
    table[i] = temp
  }
  return table
}

/**
 * CRC表
 */
const crcTable = makeTable()

/**
 * 计算CRC32
 * @param buffer 数据
 * @param start 起始下标
 * @return {number} CRC32
 */
function crc32(buffer: Uint8Array, start: number): number {
  let crc = -1
  for (let i = start; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xFF]
  }
  return crc ^ -1
}

export {crc32}
