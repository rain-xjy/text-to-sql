<template>
  <!-- 保存为常用问题对话框 -->
  <el-dialog
    v-model="saveCommonVisible"
    title="保存为常用问题"
    width="60%"
    :show-close="false"
    center
    class="common-query-dialog"
  >
    <div class="dialog-form">
      <div class="form-item">
        <div class="form-label"><span style="color: red;">*</span>问题描述：</div>
        <el-input
          v-model="commonQueryObj.descrption"
          type="input"
          placeholder="请输入描述"
        />
      </div>
      <div class="form-item">
        <div class="form-label">执行SQL：</div>
        <el-input
          v-model="commonQueryObj.executeSQL"
          type="textarea"
          :rows="4"
        />
      </div>
      <div class="form-item">
        <div class="form-label">图表配置：</div>
        <el-input
          v-model="commonQueryObj.chartConfig"
          type="textarea"
          :rows="4"
        />
      </div>
    </div>
    <div class="dialog-footer">
      <el-button class="save-btn" type="success" @click="saveCommonSubmitFunc">保存</el-button>
      <el-button class="cancel-btn" @click="saveCommonVisible = false">取消</el-button>
    </div>
  </el-dialog>
  
  <!-- 数据表格界面 -->
  <el-dialog
    v-model="dataTableVisible"
    title="常用问题数据"
    width="80%"
    :show-close="true"
    center
    class="data-table-dialog"
  >
    <div class="data-table-container">
      <el-table :data="chatHistory" style="width: 100%" border>
        <el-table-column prop="descrption" label="问题" min-width="150">
          <template #default="scope">
            <div class="table-cell-content">{{ scope.row.descrption }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数据类型" width="120">
          <template #default="scope">
            <el-tag type="success" effect="plain" v-if="scope.row.chartConfig">图表</el-tag>
            <el-tag type="info" effect="plain" v-else>数据</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executeSQL" label="SQL" min-width="200">
          <template #default="scope">
            <div class="table-cell-content sql-content">{{ scope.row.executeSQL }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="editCommonQuery(scope.row, scope.$index)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteCommonQuery(scope.$index)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { 
  commonQueries, 
  saveCommonVisible, 
  commonQueryObj, 
  dataTableVisible 
} = storeToRefs(chatStore)

// 历史记录数据
const chatHistory = commonQueries

// 保存常用问题
const saveCommonSubmitFunc = () => {
  if (!chatStore.saveCommonSubmitFunc()) {
    ElMessage.error('请输入描述')
  }
}

// 编辑常用问题
const editCommonQuery = (query, index) => {
  chatStore.editCommonQuery(query, index)
}

// 删除常用问题
const deleteCommonQuery = (index) => {
  chatStore.deleteCommonQuery(index)
}
</script>

<style scoped lang="scss">
/* 常用问题对话框样式 */
.common-query-dialog {
  :deep(.el-dialog__header) {
    padding-bottom: 10px;
  }
  
  :deep(.el-dialog__body) {
    padding: 10px 20px;
  }
  
  .dialog-form {
    .form-item {
      display: flex;
      margin-bottom: 15px;
      .form-label {
        white-space: normal;
        word-wrap: break-word;
        min-width: 80px;
        margin-right: 12px;
        margin-bottom: 5px;
        font-size: 14px;
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
    
    .save-btn {
      background-color: #67c23a;
      border-color: #67c23a;
    }
    
    .cancel-btn {
      background-color: #f0f0f0;
      border-color: #dcdfe6;
      color: #606266;
    }
  }
}

.data-table-dialog {
  .table-cell-content {
    max-height: 100px;
    overflow-y: auto;
  }
  
  .sql-content {
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
  }
  
  .table-actions {
    display: flex;
    gap: 8px;
  }
}
</style>