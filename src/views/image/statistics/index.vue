<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div ref="timeChart" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div ref="satelliteChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div ref="cloudChart" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div ref="spaceChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'
import { getImageStat } from '@/api/image/image'

const timeChart = ref()
const satelliteChart = ref()
const cloudChart = ref()
const spaceChart = ref()

onMounted(async () => {
  const res = await getImageStat()
  const data = res.data
  // const data = {
  //   timeStat: [
  //     { time: '2023-01', count: 120 },
  //     { time: '2023-02', count: 200 },
  //     { time: '2023-03', count: 150 },
  //     { time: '2023-04', count: 80 },
  //     { time: '2023-05', count: 70 },
  //     { time: '2023-06', count: 110 },
  //     { time: '2023-07', count: 130 }
  //   ],
  //   satelliteStat: [
  //     { value: 335, name: 'Landsat' },
  //     { value: 310, name: 'Sentinel' },
  //     { value: 234, name: 'MODIS' },
  //     { value: 135, name: 'WorldView' }
  //   ],
  //   cloudStat: [50, 120, 200, 80],
  //   spaceStat: [
  //     { area: '区域A', count: 300 },
  //     { area: '区域B', count: 450 },
  //     { area: '区域C', count: 150 },
  //     { area: '区域D', count: 400 }
  //   ]
  // }

  initTimeChart(data.timeStat)
  initSatelliteChart(data.satelliteStat)
  initCloudChart(data.cloudStat)
  initSpaceChart(data.spaceStat)
})

/* 影像时间统计（按月） */
function initTimeChart(data) {
  const chart = echarts.init(timeChart.value)
  chart.setOption({
    title: { text: '影像时间统计' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(i => i.time) },
    yAxis: { type: 'value' },
    series: [{
      name: '影像数量',
      type: 'line',
      data: data.map(i => i.count),
      smooth: true
    }]
  })
}

/* 卫星类型统计 */
function initSatelliteChart(data) {
  const chart = echarts.init(satelliteChart.value)
  chart.setOption({
    title: { text: '卫星类型统计', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      data
    }]
  })
}

/* 云量统计 */
function initCloudChart(data) {
  const chart = echarts.init(cloudChart.value)
  chart.setOption({
    title: { text: '云量分布统计' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['0-10%', '10-30%', '30-60%', '60-100%']
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data
    }]
  })
}

/* 空间统计（行政区/区域） */
function initSpaceChart(data) {
  const chart = echarts.init(spaceChart.value)
  chart.setOption({
    title: { text: '空间分布统计' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(i => i.area) },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: data.map(i => i.count)
    }]
  })
}
</script>

<style scoped>
.chart {
  height: 360px;
}
</style>