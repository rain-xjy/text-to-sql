<template>
  <div class="data-analysis">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="设备选择">
          <el-select v-model="filterForm.deviceId" placeholder="请选择设备">
            <el-option label="设备1" value="device1" />
            <el-option label="设备2" value="device2" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="refreshData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>温度趋势图</span>
              <el-radio-group v-model="tempTimeRange" size="small">
                <el-radio-button label="day">24小时</el-radio-button>
                <el-radio-button label="week">7天</el-radio-button>
                <el-radio-button label="month">30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart" ref="tempChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>湿度趋势图</span>
              <el-radio-group v-model="humidityTimeRange" size="small">
                <el-radio-button label="day">24小时</el-radio-button>
                <el-radio-button label="week">7天</el-radio-button>
                <el-radio-button label="month">30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart" ref="humidityChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>历史数据记录</span>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table :data="historyData" stripe>
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="temperature" label="温度(°C)" width="120" />
        <el-table-column prop="humidity" label="湿度(%)" width="120" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
              {{ scope.row.status === 'normal' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="100"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const filterForm = ref({
  deviceId: '',
  timeRange: []
})
const tempTimeRange = ref('day')
const humidityTimeRange = ref('day')
const tempChartRef = ref(null)
const humidityChartRef = ref(null)

// 模拟历史数据
const historyData = ref([
  {
    timestamp: '2024-01-20 10:00:00',
    temperature: 25.6,
    humidity: 65,
    status: 'normal'
  },
  {
    timestamp: '2024-01-20 11:00:00',
    temperature: 26.2,
    humidity: 68,
    status: 'normal'
  },
  {
    timestamp: '2024-01-20 12:00:00',
    temperature: 28.5,
    humidity: 75,
    status: 'danger'
  }
])

onMounted(() => {
  initCharts()
})

const initCharts = () => {
  const tempChart = echarts.init(tempChartRef.value)
  const humidityChart = echarts.init(humidityChartRef.value)

  // 生成模拟数据
  const now = new Date()
  const tempData = []
  const humidityData = []
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now - (24 - i) * 3600 * 1000)
    tempData.push([
      time,
      Math.random() * 10 + 20
    ])
    humidityData.push([
      time,
      Math.random() * 20 + 50
    ])
  }

  const tempOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const date = new Date(params[0].value[0])
        return date.toLocaleString() + '<br/>' +
          params[0].marker + '温度：' + params[0].value[1].toFixed(1) + '°C'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      axisLabel: {
        formatter: '{value} °C'
      }
    },
    series: [{
      name: '温度',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
        color: '#f56c6c'
      },
      areaStyle: {
        opacity: 0.2,
        color: '#f56c6c'
      },
      data: tempData
    }]
  }

  const humidityOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const date = new Date(params[0].value[0])
        return date.toLocaleString() + '<br/>' +
          params[0].marker + '湿度：' + params[0].value[1].toFixed(1) + '%'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '湿度(%)',
      axisLabel: {
        formatter: '{value} %'
      }
    },
    series: [{
      name: '湿度',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2,
        color: '#409EFF'
      },
      areaStyle: {
        opacity: 0.2,
        color: '#409EFF'
      },
      data: humidityData
    }]
  }

  tempChart.setOption(tempOption)
  humidityChart.setOption(humidityOption)
}

const refreshData = () => {
  // 刷新数据逻辑
}

const exportData = () => {
  // 导出数据逻辑
}

const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`)
}

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`)
}
</script>

<style scoped>
.data-analysis {
  padding: 20px;
}
.filter-card {
  margin-bottom: 20px;
}
.chart-row {
  margin-bottom: 20px;
}
.chart-card {
  height: 100%;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart {
  height: 350px;
}
.table-card {
  margin-top: 20px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>