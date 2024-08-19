/**
 * Ip2Region异常类
 * @version 2024/08/19 11:11:11
 * @author ALI[ali-k&#64;foxmail.com]
 * @since 1.0.0
 */
class Ip2RegionException extends Error {

  /**
   * Ip2Region异常
   * @param message 信息
   */
  constructor(message?: string) {
    super(message)
    this.name = 'Ip2RegionException'
  }
}

export {Ip2RegionException}
