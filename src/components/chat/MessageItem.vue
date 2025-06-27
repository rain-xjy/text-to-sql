<template>
  <div class="message" :class="message.role">
    <!-- 用户消息 -->
    <div v-if="message.role === 'user'" class="message-content">
      <div class="message-text">{{ message.content }}</div>
    </div>
    
    <!-- AI助手消息 -->
    <div v-if="message.role === 'assistant'">
      <div class="message-content">
        <div class="message-text">{{ message.content }}</div>
      </div>
      <div class="ai-answer">
        <!-- 查询结果(SQL代码) -->
        <div v-if="message.sqlQuery && displaySettings.showSqlQuery" class="answer-section">
          <div class="section-title">查询结果</div>
          <div class="section-content">
            <div class="code-wrapper">
              <pre class="sql-code"><code>{{ message.sqlQuery }}</code></pre>
              <el-button class="copy-btn" size="small" type="primary" @click="copyToClipboard(message.sqlQuery)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
          <el-divider />
        </div>
        
        <!-- 图表配置代码 -->
        <div v-if="message.chartConfig && displaySettings.showChartConfig" class="answer-section">
          <div class="section-title">图表配置代码</div>
          <div class="section-content">
            <div class="code-wrapper">
              <pre class="chart-code"><code>{{ typeof message.chartConfig === 'string' ? message.chartConfig : JSON.stringify(message.chartConfig, null, 2) }}</code></pre>
              <el-button class="copy-btn" size="small" type="primary" @click="copyToClipboard(typeof message.chartConfig === 'string' ? message.chartConfig : JSON.stringify(message.chartConfig, null, 2))">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
          <el-divider />
        </div>
        
        <!-- 图表展示 -->
        <div v-if="message.chartConfig && displaySettings.showChart" class="answer-section">
          <div class="section-title">图表展示</div>
          <div class="section-content chart-display">
            <div ref="chartRef" class="result-chart"></div>
          </div>
          <el-divider />
        </div>
        
        <!-- 总结 -->
        <div v-if="message.summary && displaySettings.showSummary" class="answer-section">
          <div class="section-title">总结</div>
          <div class="section-content summary">
            <div class="long-text-content">{{ message.summary }}</div>
          </div>
          <el-divider />
        </div>
        
        <!-- 问题建议 -->
        <div v-if="message.suggestions && displaySettings.showSuggestions" class="answer-section">
          <div class="section-title">相关问题</div>
          <div class="section-content suggestions">
            <div class="related-questions">
              <el-button 
                v-for="(question, qIndex) in parsedQuestions" 
                :key="qIndex"
                type="primary"
                size="small"
                plain
                class="question-btn"
                @click="askRelatedQuestion(question)"
              >
                {{ question }}
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-if="message.confirmMessage" class="message-content">
          <div class="message-text">{{ message.confirmMessage }}</div>
        </div>
      </div>

      <!-- 添加确认按钮组 -->
      <div v-if="message.role === 'assistant' && message.isConfirmation" class="confirm-actions">
        <el-button type="primary" size="small" @click="handleConfirmation(message)" plain>是的,保存至训练集</el-button>
        <el-button type="primary" size="small" @click="saveCommonFunc(message)" plain>保存为常用问题</el-button>
        <el-button type="danger" size="small" @click="incorrectFunc(message)" plain>不正确</el-button>
      </div>
    </div>
    
    <!-- SQL查询输入 -->
    <div v-if="message.role === 'sqlQuery' && sqlQueryVisible">
      <div class="message-content">
        <div class="message-text">请输入SQL：</div>
        <div style="margin-top: 10px;">
          <el-input
            v-model="inputSQL"
            type="textarea"
            :rows="5"
            placeholder="输入SQL"
          />
        </div>
        <div style="margin-top: 10px;">
          <el-button type="primary" size="small" @click="executeSQLFunc" :loading="loading">执行SQL</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Plotly from 'plotly.js-dist'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const chatStore = useChatStore()
const { displaySettings, loading, sqlQueryVisible, inputSQL } = storeToRefs(chatStore)

// 图表引用
const chartRef = ref(null)

// 解析问题建议
const parsedQuestions = computed(() => {
  if (!props.message.suggestions) return []
  return chatStore.parseRelatedQuestions(props.message.suggestions)
})

// 复制到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 处理确认
const handleConfirmation = (message) => {
  // 这里可以添加保存至训练集的逻辑
  console.log('保存至训练集', message)
}

// 保存为常用问题
const saveCommonFunc = (message) => {
  chatStore.saveCommonFunc(message)
}

// 不正确反馈
const incorrectFunc = (message) => {
  chatStore.incorrectFunc(message)
}

// 执行SQL
const executeSQLFunc = () => {
  if (chatStore.executeSQLFunc()) {
    // 执行成功后的逻辑
  }
}

// 提问相关问题
const askRelatedQuestion = (question) => {
  chatStore.askRelatedQuestion(question)
}

// 渲染图表
const renderChart = () => {
  if (props.message.chartConfig && chartRef.value) {
    try {
      const config = typeof props.message.chartConfig === 'string' 
        ? JSON.parse(props.message.chartConfig) 
        : props.message.chartConfig
      
      Plotly.newPlot(
        chartRef.value, 
        config.data, 
        config.layout
      )
    } catch (error) {
      console.error('图表渲染失败:', error)
    }
  }
}

// 监听消息变化，重新渲染图表
watch(() => props.message.chartConfig, () => {
  setTimeout(renderChart, 100)
})

onMounted(() => {
  renderChart()
})
</script>

<style scoped lang="scss">
.message {
  margin-bottom: 20px;
}

.message-content {
  display: inline-block;
  max-width: 80%;
  padding: 14px 18px;
  border-radius: 12px;
  position: relative;
  font-size: 14px;
  line-height: 1.6;
}

.message.user {
  text-align: right;
}

.message.user .message-content {
  background-color: #409eff;
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message.user .message-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.25);
}

.message.assistant .message-content {
  background-color: #fff;
  color: #333;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.message.sqlQuery .message-content {
  min-width: 80%;
  padding: 14px 18px;
  border-radius: 12px;
  position: relative;
  background-color: rgb(166 195 99 / 30%);
  color: #333;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.ai-answer {
  padding: 0 20px;
}

.answer-section {
  margin: 20px 0;
}

.section-title {
  font-weight: 500;
  margin-bottom: 10px;
  color: #303133;
}

.section-content {
  color: #606266;
  line-height: 1.6;
}

.code-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.sql-code, .chart-code {
  background-color: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  white-space: pre;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
  width: 100%;
}

.copy-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
}

.chart-display {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.result-chart {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.summary, .suggestions {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-line;
  max-height: 400px;
  overflow-y: auto;
}

.long-text-content {
  text-align: justify;
  line-height: 1.8;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  word-break: break-word;
}

.related-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.question-btn {
  margin-bottom: 8px;
  text-align: left;
  white-space: normal;
  height: auto;
  padding: 8px 15px;
  line-height: 1.4;
}

.question-btn + .question-btn {
  margin-left: 0px;
}

.confirm-actions {
  display: flex;
  justify-content: left;
  margin-top: 12px;
  padding: 0 20px;
}

.confirm-actions .el-button {
  margin: 0 4px;
}
</style>