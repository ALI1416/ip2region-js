import {Uint8ArrayReader, Uint8ArrayWriter, ZipReader} from '@zip.js/zip.js'
import {Ip2RegionException} from './Ip2RegionException'
import {Region} from './Region'
import {crc32} from './Crc32'

const decoder = new TextDecoder()

/**
 * IP地址转区域
 * @version 2024/08/19 11:11:11
 * @author ALI[ali-k&#64;foxmail.com]
 * @since 1.0.0
 */
class Ip2Region {

  /**
   * 已初始化
   */
  private isInit: boolean = false
  /**
   * 数据
   */
  private buffer: DataView
  /**
   * 二级索引区指针
   */
  private vector2AreaPtr: number
  /**
   * 索引区指针
   */
  private vectorAreaPtr: number

  /**
   * 是否已经初始化
   * @return  {boolean} 是否已经初始化
   */
  initialized(): boolean {
    return this.isInit
  }

  /**
   * 初始化实例通过URL<br>
   * 例如：<code>https://www.404z.cn/files/ip2region/v3.0.0/data/ip2region.zdb</code>
   * @param url URL
   * @return {Promise<void>} Promise
   */
  async initByUrl(url: string): Promise<void> {
    if (this.isInit) {
      throw new Ip2RegionException('已经初始化过了，不可重复初始化！')
    }
    // console.log(`手机号码转区域初始化：URL路径URL_PATH ${url}`)
    await this.init(await (await fetch(url)).arrayBuffer())
  }

  /**
   * 初始化实例
   * @param arraybuffer 压缩的zdb ArrayBuffer
   * @return {Promise<void>} Promise
   */
  async init(arraybuffer: ArrayBuffer): Promise<void> {
    if (this.isInit) {
      throw new Ip2RegionException('已经初始化过了，不可重复初始化！')
    }
    if (!arraybuffer) {
      throw new Ip2RegionException('数据文件为空！')
    }
    const zipReader = new ZipReader(new Uint8ArrayReader(new Uint8Array(arraybuffer)))
    const db = await (await zipReader.getEntries()).shift().getData(new Uint8ArrayWriter())
    this.buffer = new DataView(db.buffer)
    const crc32OriginValue = this.buffer.getInt32(0, true)
    if (crc32OriginValue !== crc32(db, 4)) {
      throw new Ip2RegionException('数据文件校验错误！')
    }
    this.vector2AreaPtr = this.buffer.getInt32(12, true)
    this.vectorAreaPtr = this.buffer.getInt32(16, true)
    this.isInit = true
    // console.log(`数据加载成功：版本号VERSION ${this.buffer.getInt32(4, true)} ，校验码CRC32 ${(crc32OriginValue < 0 ? crc32OriginValue + 0x100000000 : crc32OriginValue).toString(16).toLocaleUpperCase().padStart(8, '0')}`)
  }

  /**
   * 解析IP地址的区域
   * @param ip IP地址
   * @return {Region | undefined} Region(找不到返回undefined)
   */
  parse(ip: string | number): Region | undefined {
    if (typeof ip === 'string') {
      return this.innerParse(this.ip2Number(ip))
    } else if (typeof ip === 'number') {
      if (ip < 0 || ip > 0xFFFFFFFF) {
        throw new Ip2RegionException(`number型IP地址 ${ip} 不合法！`)
      }
      return this.innerParse(ip)
    } else {
      throw new Ip2RegionException(`类型 ${(typeof ip)} 不合法！应为 string | number`)
    }
  }

  /**
   * IP地址转number
   *
   * @param ip IP地址
   * @return {number} number型IP地址
   */
  ip2Number(ip: string): number {
    if (!ip) {
      throw new Ip2RegionException('IP地址不能为空！')
    }
    let s = ip.split('.')
    if (s.length !== 4) {
      throw new Ip2RegionException(`IP地址 ${ip} 不合法！`)
    }
    let address = 0
    for (let i = 0; i < 4; i++) {
      let v = Number(s[i])
      if (v < 0 || v > 255) {
        throw new Ip2RegionException(`IP地址 ${ip} 不合法！`)
      }
      address |= (v << 8 * (3 - i))
    }
    return address
  }

  /**
   * number转IP地址
   *
   * @param ip number型IP地址
   * @return {string} IP地址
   */
  number2Ip(ip: number): string {
    if (ip < 0 || ip > 0xFFFFFFFF) {
      throw new Ip2RegionException(`number型IP地址 ${ip} 不合法！`)
    }
    return ((ip >> 24) & 0xFF) + '.' + ((ip >> 16) & 0xFF) + '.' + ((ip >> 8) & 0xFF) + '.' + ((ip) & 0xFF)
  }

  /**
   * 是合法的IP地址
   *
   * @param ip IP地址
   * @return {boolean} 是否合法
   */
  isValidIp(ip: string | number): boolean {
    if (typeof ip === 'number') {
      return ip >= 0 && ip <= 0xFFFFFFFF
    } else {
      if (!ip) {
        return false
      }
      let s = ip.split('.')
      if (s.length !== 4) {
        return false
      }
      for (let i = 0; i < 4; i++) {
        let v = Number(s[i])
        if (v < 0 || v > 255) {
          return false
        }
      }
      return true
    }
  }

  /**
   * 解析number型IP地址的区域(内部)
   * @param ip number型IP地址
   * @return {Region | undefined} Region(找不到返回undefined)
   */
  private innerParse(ip: number): Region | undefined {
    if (!this.isInit) {
      throw new Ip2RegionException('未初始化！')
    }

    // 二级索引区
    let pos = this.vector2AreaPtr + ((ip >>> 16) << 2)
    let left = this.buffer.getInt32(pos, true)
    let right = this.buffer.getInt32(pos + 4, true)

    // 索引区
    if (left === right || left === right - 8) {
      pos = left + 4
    } else {
      right -= 8
      // 二分查找
      let ipSegments = ip & 0xFFFF
      // 索引区
      while (left <= right) {
        pos = this.align(Math.floor((left + right) / 2))
        // 查找是否匹配到
        let startAndEnd = this.buffer.getInt32(pos) & 0xFF
        let ipSegmentsStart = startAndEnd & 0xFFFF
        let ipSegmentsEnd = startAndEnd >>> 16
        if (ipSegments < ipSegmentsStart) {
          right = pos - 8
        } else if (ipSegments > ipSegmentsEnd) {
          left = pos + 8
        } else {
          break
        }
      }
      pos += 4
    }

    // 记录区
    pos = this.buffer.getInt32(pos, true)
    let recordValueLength = this.buffer.getInt8(pos) & 0xFF
    pos++
    let recordValue = this.buffer.buffer.slice(pos, pos + recordValueLength)
    return new Region(decoder.decode(new Uint8Array(recordValue)))
  }

  /**
   * 字节对齐
   * @param pos 位置
   * @return {number} 对齐后的位置
   */
  private align(pos: number): number {
    let remain = (pos - this.vectorAreaPtr) % 8
    if (pos - this.vectorAreaPtr < 8) {
      return pos - remain
    } else if (remain !== 0) {
      return pos + 8 - remain
    } else {
      return pos
    }
  }
}

export {Ip2Region}
