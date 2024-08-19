/**
 * 区域
 * @version 2024/08/19 11:11:11
 * @author ALI[ali-k&#64;foxmail.com]
 * @since 1.0.0
 */
class Region {

  /**
   * 国家
   */
  readonly country: string
  /**
   * 省份
   */
  readonly province: string
  /**
   * 城市
   */
  readonly city: string
  /**
   * ISP
   */
  readonly isp: string

  /**
   * 构造函数
   * @param region 区域字符串
   */
  constructor(region: string) {
    // 国家|省份|城市|ISP
    let s = region.split('|')
    if (s.length === 4) {
      this.country = s[0]
      this.province = s[1]
      this.city = s[2]
      this.isp = s[3]
    }
  }

}

export {Region}
