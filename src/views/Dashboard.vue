<template>
  <div class="dashboard">
    <!-- 顶部数据卡片 -->

    
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in dataCards" :key="card.title">
        <el-card class="data-card" :class="card.type">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
            <div class="data-info">
              <div class="value">{{ card.value }}</div>
              <div class="title">{{ card.title }}</div>
            </div>
          </div>
          <div class="card-footer">
            <span>{{ card.change }}%</span>
            较上周
            <el-icon class="trend-icon" :class="card.change >= 0 ? 'up' : 'down'">
              <CaretTop v-if="card.change >= 0" />
              <CaretBottom v-else />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>设备运行状态趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="main-chart" ref="mainChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>设备状态分布</span>
            </div>
          </template>
          <div class="pie-chart" ref="pieChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备列表 -->
    <el-card class="device-card">
      <template #header>
        <div class="device-header">
          <span>设备状态</span>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="deviceList" stripe style="width: 100%">
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="type" label="设备类型" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新时间" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="handleDetail(scope.row)">
              详情
            </el-button>
            <el-button type="warning" link @click="handleControl(scope.row)">
              控制
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Monitor, Warning, Connection, DataLine, CaretTop, CaretBottom } from '@element-plus/icons-vue'

// 顶部卡片数据
const dataCards = ref([
  { title: '设备总数', value: 128, change: 5.2, type: 'primary', icon: 'Monitor' },
  { title: '在线设备', value: 98, change: 3.1, type: 'success', icon: 'Connection' },
  { title: '告警设备', value: 3, change: -2.5, type: 'danger', icon: 'Warning' },
  { title: '数据点数', value: '12,836', change: 8.5, type: 'info', icon: 'DataLine' }
])

// 时间范围
const timeRange = ref('today')

// 设备列表数据
const deviceList = ref([
  { name: '温湿度传感器01', type: '传感器', status: 'online', lastUpdate: '2024-01-20 15:30:00' },
  { name: '光照传感器02', type: '传感器', status: 'offline', lastUpdate: '2024-01-20 14:20:00' },
  { name: '控制器01', type: '控制器', status: 'warning', lastUpdate: '2024-01-20 15:28:00' }
])

// 图表初始化
onMounted(() => {
  initMainChart()
  initPieChart()
})

// 初始化主图表
const mainChartRef = ref(null)
const initMainChart = () => {
  const chart = echarts.init(mainChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['在线设备', '数据流量', '告警次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    yAxis: [
      {
        type: 'value',
        name: '设备数量'
      },
      {
        type: 'value',
        name: '数据量',
        axisLabel: {
          formatter: '{value} KB'
        }
      }
    ],
    series: [
      {
        name: '在线设备',
        type: 'line',
        smooth: true,
        data: [90, 92, 89, 95, 98, 96, 93, 91]
      },
      {
        name: '数据流量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [820, 932, 901, 934, 1290, 1330, 1320, 1000]
      },
      {
        name: '告警次数',
        type: 'bar',
        data: [2, 1, 0, 1, 3, 2, 1, 0]
      }
    ]
  }
  chart.setOption(option)
}

// 初始化饼图
const pieChartRef = ref(null)
const initPieChart = () => {
  const chart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 98, name: '在线' },
          { value: 27, name: '离线' },
          { value: 3, name: '告警' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 状态处理函数
const getStatusType = (status) => {
  const types = {
    online: 'success',
    offline: 'info',
    warning: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线',
    warning: '告警'
  }
  return texts[status] || '未知'
}

// 操作处理函数
const handleDetail = (row) => {
  console.log('查看详情:', row)
}

const handleControl = (row) => {
  console.log('设备控制:', row)
}
</script>

<style scoped lang="scss" >
.dashboard {
  padding: 20px;
}

.data-card {
  margin-bottom: 20px;
  .card-content {
    display: flex;
    align-items: center;
    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      .el-icon {
        font-size: 24px;
        color: white;
      }
    }
    .data-info {
      .value {
        font-size: 24px;
        font-weight: bold;
        line-height: 1.2;
      }
      .title {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  .card-footer {
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
    .trend-icon {
      margin-left: 4px;
      &.up { color: #67C23A; }
      &.down { color: #F56C6C; }
    }
  }
}

.data-card.primary .icon-wrapper { background-color: #409EFF; }
.data-card.success .icon-wrapper { background-color: #67C23A; }
.data-card.danger .icon-wrapper { background-color: #F56C6C; }
.data-card.info .icon-wrapper { background-color: #909399; }

.chart-row {
  margin: 20px 0;
}

.chart-card {
  margin-bottom: 20px;
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.main-chart {
  height: 400px;
}

.pie-chart {
  height: 400px;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>