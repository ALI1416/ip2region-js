// node test-node.js
const fs = require('fs')
const {Ip2Region} = require('../dist/ip2region.node')

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
}
