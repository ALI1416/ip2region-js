// node test-js.js
const fs = require('fs')
const Ip2Region = require('../dist/ip2region.js')

let url = 'https://www.404z.cn/files/ip2region/v3.0.0/data/ip2region.zdb'
let zdbPath = 'D:/ip2region.zdb'

let ip2Region = new Ip2Region()

// runUrl()
runFile()

async function runUrl() {
  await ip2Region.initByUrl(url)
  run()
}

async function runFile() {
  console.log(`是否已经初始化：${ip2Region.initialized()}`)
  let buffer = fs.readFileSync(zdbPath).buffer
  await ip2Region.init(buffer)
  console.log(`是否已经初始化：${ip2Region.initialized()}`)
  run()
}

function run() {
  console.log(ip2Region.parse('0.0.0.0'))
  console.log(ip2Region.parse('123.132.0.0'))
  console.log(`ip2Number 123.132.0.0 -> ${ip2Region.ip2Number('123.132.0.0')}`)
  console.log(`number2Ip 2072248320 -> ${ip2Region.number2Ip('2072248320')}`)
  console.log(`123.132.0.0 是合法的IP地址 -> ${ip2Region.isValidIp('123.132.0.0')}`)
}
