<script setup>
import {ref} from 'vue'
import {Ip2Region} from '@ali1416/ip2region'

const url = ref('https://www.404z.cn/files/ip2region/v3.0.0/data/ip2region.zdb')
const ip = ref('123.132.0.0')
const tip = ref()
const result = ref()

const reader = new FileReader()
const ip2Region = new Ip2Region()

async function loadUrl() {
  try {
    await ip2Region.initByUrl(url.value)
  } catch (e) {
    console.error(e)
    tip.value = e
  }
  tip.value = 'URL地址加载成功！'
}

let zdbFile

function fileChange(e) {
  zdbFile = e.target.files[0]
}

function loadFile() {
  try {
    reader.onload = async function (e) {
      try {
        await ip2Region.init(e.target.result)
      } catch (e) {
        console.error(e)
        tip.value = e
      }
    }
    reader.readAsArrayBuffer(zdbFile)
    tip.value = 'zdb文件加载成功！'
  } catch (e) {
    console.error(e)
    tip.value = e
  }
}

function parse() {
  try {
    result.value = JSON.stringify(ip2Region.parse(ip.value))
  } catch (e) {
    console.error(e)
    tip.value = e
  }
}
</script>

<template>
  <label for="url">URL地址：</label><input id="url" v-model="url" size="60" type="text">
  <button @click="loadUrl">加载</button>
  <br>
  <label for="file">zdb文件：</label><input id="file" type="file" @change="fileChange">
  <button @click="loadFile">加载</button>
  <br>
  <label for="ip">IP地址：</label><input id="ip" v-model="ip" type="text">
  <button @click="parse">解析</button>
  <p v-html="tip"></p>
  <hr>
  <div v-html="result"></div>
</template>
