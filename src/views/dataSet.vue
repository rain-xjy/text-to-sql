<template>
  <div class="dataset-container">
    <div class="dataset-header">
      <h3>数据集管理</h3>
    </div>
    
    <!-- 表格数据展示区域 -->
    <div class="table-container">
      <!-- 搜索和功能按钮区域 -->
      <div class="table-header">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="请输入要查询的问题或数据类型"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
        <div class="action-buttons">
          <el-button type="success" @click="handleAddDataSet">
            <el-icon><Plus /></el-icon>新建训练数据集
          </el-button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <el-table :data="filteredTableData" style="width: 100%" border>
        <el-table-column prop="question" label="问题" min-width="150">
          <template #default="scope">
            <div class="table-cell-content">{{ scope.row.question }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数据类型" width="120">
          <template #default="scope">
            <el-tag type="success" effect="plain" v-if="scope.row.dataType === 'DDL'">DDL</el-tag>
            <el-tag type="info" effect="plain" v-else-if="scope.row.dataType === 'DML'">DML</el-tag>
            <el-tag type="warning" effect="plain" v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sql" label="SQL" min-width="200">
          <template #default="scope">
            <div class="table-cell-content sql-content">{{ scope.row.sql }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="handleEdit(scope.row, scope.$index)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.$index)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 新增/编辑数据集对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑数据集' : '新增数据集'"
      width="60%"
      :show-close="true"
      center
    >
      <div class="dialog-form">
        <div class="form-item">
          <div class="form-label"><span style="color: red;">*</span>问题：</div>
          <el-input
            v-model="currentDataSet.question"
            type="input"
            placeholder="请输入问题"
          />
        </div>
        <div class="form-item">
          <div class="form-label"><span style="color: red;">*</span>数据类型：</div>
          <el-select v-model="currentDataSet.dataType" placeholder="请选择数据类型">
            <el-option label="DDL" value="DDL" />
            <el-option label="DML" value="DML" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </div>
        <div class="form-item">
          <div class="form-label"><span style="color: red;">*</span>SQL：</div>
          <el-input
            v-model="currentDataSet.sql"
            type="textarea"
            :rows="4"
            placeholder="请输入SQL语句"
          />
        </div>
      </div>
      <div class="dialog-footer">
        <el-button class="save-btn" type="success" @click="saveDataSet">保存</el-button>
        <el-button class="cancel-btn" @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'


// 搜索相关
const searchQuery = ref('')
const handleSearch = () => {
  // 实现搜索功能
  console.log('搜索:', searchQuery.value)
}

// 表格数据
const tableData = ref([
  {
    id: 1,
    question: '查询所有用户信息',
    dataType: 'DML',
    sql: 'SELECT * FROM users WHERE status = 1'
  },
  {
    id: 2,
    question: '创建用户表',
    dataType: 'DDL',
    sql: 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), created_at TIMESTAMP)'
  },
  {
    id: 3,
    question: '查询最近一周的订单数据',
    dataType: 'DML',
    sql: 'SELECT order_id, customer_name, amount FROM orders WHERE created_at > NOW() - INTERVAL 7 DAY'
  }
])

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchQuery.value) return tableData.value
  
  return tableData.value.filter(item => {
    return item.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
           item.dataType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
           item.sql.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentDataSet = ref({
  id: null,
  question: '',
  dataType: '',
  sql: ''
})
const currentIndex = ref(-1)

// 新增数据集
const handleAddDataSet = () => {
  isEdit.value = false
  currentDataSet.value = {
    id: Date.now(),
    question: '',
    dataType: '',
    sql: ''
  }
  dialogVisible.value = true
}

// 编辑数据集
const handleEdit = (row, index) => {
  isEdit.value = true
  currentDataSet.value = JSON.parse(JSON.stringify(row))
  currentIndex.value = index
  dialogVisible.value = true
}

// 删除数据集
const handleDelete = (index) => {
  ElMessageBox.confirm(
    '确定要删除这条数据吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    tableData.value.splice(index, 1)
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
  }).catch(() => {
    // 取消删除
  })
}

// 保存数据集
const saveDataSet = () => {
  // 表单验证
  if (!currentDataSet.value.question) {
    ElMessage.error('请输入问题')
    return
  }
  if (!currentDataSet.value.dataType) {
    ElMessage.error('请选择数据类型')
    return
  }
  if (!currentDataSet.value.sql) {
    ElMessage.error('请输入SQL语句')
    return
  }
  
  if (isEdit.value) {
    // 编辑模式
    tableData.value[currentIndex.value] = JSON.parse(JSON.stringify(currentDataSet.value))
    ElMessage({
      type: 'success',
      message: '更新成功'
    })
  } else {
    // 新增模式
    tableData.value.push(JSON.parse(JSON.stringify(currentDataSet.value)))
    ElMessage({
      type: 'success',
      message: '添加成功'
    })
  }
  
  dialogVisible.value = false
}

// 生命周期钩子
onMounted(() => {
  // 可以在这里加载初始数据
  console.log('数据集管理页面已加载')
})
</script>

<style scoped>
.dataset-container {
  display: flex;
  flex-direction: column;
  /* height: 100%; */
  padding: 20px;
}

.dataset-header {
  margin-bottom: 20px;
}

.menu-bar {
  margin-bottom: 20px;
}

.dataset-menu {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.table-container {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.table-cell-content {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

.sql-content {
  font-family: monospace;
  max-height: 100px;
  overflow-y: auto;
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* 对话框样式 */
.dialog-form {
  padding: 10px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  margin-bottom: 8px;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>