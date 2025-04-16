<template>
  <div class="devices">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="8" v-for="stat in deviceStats" :key="stat.title">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备管理主区域 -->
    <el-card class="device-list-card">
      <template #header>
        <div class="list-header">
          <div class="header-left">
            <h3>设备列表</h3>
            <el-tag v-for="tag in filterTags" 
                    :key="tag.value" 
                    :type="tag.type"
                    closable
                    @close="removeFilter(tag)">
              {{ tag.label }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>添加设备
            </el-button>
            <el-button type="success">
              <el-icon><Upload /></el-icon>批量导入
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选区 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.name" placeholder="请输入设备名称" clearable />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.type" placeholder="请选择设备类型" clearable>
            <el-option v-for="type in deviceTypes" 
                       :key="type.value" 
                       :label="type.label" 
                       :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option v-for="status in deviceStatus" 
                       :key="status.value" 
                       :label="status.label" 
                       :value="status.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 设备列表表格 -->
      <el-table :data="deviceList" stripe border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="设备名称" min-width="150">
          <template #default="scope">
            <div class="device-name">
              <el-icon :class="scope.row.type"><Monitor /></el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="设备类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="location" label="安装位置" width="150" />
        <el-table-column prop="lastUpdate" label="最后更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" link @click="handleDetail(scope.row)">
                详情
              </el-button>
              <el-button type="success" link @click="handleControl(scope.row)">
                控制
              </el-button>
              <el-button type="warning" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑设备对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="dialogType === 'add' ? '添加设备' : '编辑设备'"
      width="600px"
    >
      <el-form :model="deviceForm" label-width="100px" :rules="rules">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型">
            <el-option v-for="type in deviceTypes" 
                       :key="type.value" 
                       :label="type.label" 
                       :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="deviceForm.ip" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="deviceForm.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDevice">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  Monitor, Plus, Upload, Search,
  Connection, Warning, Setting 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 设备统计数据
const deviceStats = ref([
  { title: '总设备数', value: 128, type: 'primary', icon: 'Monitor' },
  { title: '在线设备', value: 98, type: 'success', icon: 'Connection' },
  { title: '告警设备', value: 3, type: 'danger', icon: 'Warning' }
])

// 设备类型选项
const deviceTypes = [
  { label: '温湿度传感器', value: 'temp-humid' },
  { label: '光照传感器', value: 'light' },
  { label: '控制器', value: 'controller' }
]

// 设备状态选项
const deviceStatus = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '告警', value: 'warning' }
]

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 设备表单
const deviceForm = reactive({
  name: '',
  type: '',
  ip: '',
  location: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }]
}

// 对话框控制
const showAddDialog = ref(false)
const dialogType = ref('add')



// 设备列表数据
const deviceList = ref([
  {
    name: '温湿度传感器01',
    type: '温湿度传感器',
    status: 'online',
    ip: '192.168.1.100',
    location: '1号车间',
    lastUpdate: '2024-01-20 15:30:00'
  },
  // ... 更多设备数据
])
// 在 script setup 中添加以下方法和数据
const getStatusType = (status) => {
  const statusMap = {
    online: 'success',
    offline: 'info',
    warning: 'danger'
  }
  return statusMap[status] || 'info'
}



const getStatusText = (status) => {
  const textMap = {
    online: '在线',
    offline: '离线',
    warning: '告警'
  }
  return textMap[status] || '未知'
}

// 修改 filterTags 的初始数据
const filterTags = ref([
  { label: '温湿度传感器', value: 'temp-humid', type: 'info' },
  { label: '在线', value: 'online', type: 'success' }
])
const resetSearch = () => {
  // 重置搜索表单
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

const handleSearch = () => {
  // 搜索逻辑
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}

const submitDevice = () => {
  // 提交设备表单逻辑
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该设备吗？', '提示', {
    type: 'warning'
  }).then(() => {
    // 删除设备逻辑
    ElMessage.success('删除成功')
  })
}

// 补充缺少的接口方法
const handleEdit = (row) => {
  dialogType.value = 'edit'
  deviceForm.name = row.name
  deviceForm.type = row.type
  deviceForm.ip = row.ip
  deviceForm.location = row.location
  deviceForm.description = row.description || ''
  showAddDialog.value = true
}

const handleDetail = (row) => {
  // 实现查看详情逻辑
  console.log('查看设备详情:', row)
}

const handleControl = (row) => {
  // 实现设备控制逻辑
  console.log('控制设备:', row)
}

const removeFilter = (tag) => {
  // 实现移除筛选标签逻辑
  filterTags.value = filterTags.value.filter(item => item.value !== tag.value)
}
</script>

<style lang="scss" scoped>
.devices {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
  
  .stat-content {
    display: flex;
    align-items: center;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      .el-icon {
        font-size: 30px;
        color: white;
      }
    }
    
    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        line-height: 1;
        margin-bottom: 8px;
      }
      
      .stat-title {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.stat-card {
  &.primary .stat-icon { background-color: #409EFF; }
  &.success .stat-icon { background-color: #67C23A; }
  &.danger .stat-icon { background-color: #F56C6C; }
}

.device-list-card {
  margin-top: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-left {
    display: flex;
    align-items: center;
    
    h3 {
      margin: 0;
      margin-right: 15px;
    }
    
    .el-tag {
      margin-right: 8px;
    }
  }
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.device-name {
  display: flex;
  align-items: center;
  
  .el-icon {
    margin-right: 8px;
    font-size: 18px;
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-button-group) {
  .el-button {
    margin-left: 0 !important;
  }
}
</style>