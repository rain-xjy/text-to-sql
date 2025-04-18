<template>
  <div class="chat-container">
    <!-- 左侧历史记录 -->
    <div class="chat-history">
      <div class="history-header">
        <el-button type="primary" @click="startNewChat">
          <el-icon><Plus /></el-icon>
          开始新对话
        </el-button>
      </div>
      <!-- :class="{ active: currentChatId === chat.id }" -->
      <div class="history-list">
        <div
          v-for="(chat, index) in chatHistory"
          :key="index"
          class="history-item"
          
          @click="loadCommonQuery(chat)"
        >
          <el-icon><ChatDotRound /></el-icon>
          <span class="query-title">{{ chat.descrption }}</span>
          <!-- <span class="query-sql">{{ chat.executeSQL }}</span> -->
        </div>
      </div>
    </div>

    <!-- 右侧对话区域 -->
    <div class="chat-main">
      <div class="chat-messages" ref="messageContainer">
        <div
          v-for="(message, index) in currentMessages"
          :key="index"
          class="message"
          :class="message.role"
        >
          <div v-if="message.role === 'user'" class="message-content">
            <div class="message-text">{{message.content}}</div>
          </div>
          
          <div v-if="message.role === 'assistant'">
            <div class="message-content">
              <div class="message-text">{{message.content}}</div>
            </div>
            <div class="ai-answer">
              <!-- <div  class="answer-header">
                <el-icon><ChatDotRound /></el-icon>
                <span>AI助手</span>
                <span class="time-info">已完成思考 (用时 10 秒)</span>
              </div> -->

              <!-- 1. SQL思考过程 -->
              <!-- <div v-if="message.sqlThinkingProcess" class="answer-section">
                <div class="section-title">SQL生成思考过程</div>
                <div class="section-content thinking-process">
                  <div class="long-text-content">{{ message.sqlThinkingProcess }}</div>
                </div>
                <el-divider />
              </div> -->
              <!-- 2. 查询结果(SQL代码) -->
              <div v-if="message.sqlQuery" class="answer-section">
                <div class="section-title">查询结果</div>
                <div class="section-content">
                  <div class="code-wrapper">
                    <pre class="sql-code"><code>{{ message.sqlQuery }}</code></pre>
                    <el-button class="copy-btn" size="small" type="primary" @click="copyToClipboard(sqlQuery)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
                <el-divider />
              </div>
              <!-- 3. 图表配置代码 -->
              <div v-if="message.chartConfig" class="answer-section">
                <div class="section-title">图表配置代码</div>
                <div class="section-content">
                  <div class="code-wrapper">
                    <pre class="chart-code"><code>{{ message.chartConfig }}</code></pre>
                    <el-button class="copy-btn" size="small" type="primary" @click="copyToClipboard(chartConfig)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
                <el-divider />
              </div>
              <!-- 4. 图表展示 -->
              <div v-if="message.chartConfig" class="answer-section">
                <div class="section-title">图表展示</div>
                <div class="section-content chart-display">
                  <div :ref="(el) => bindPlotRef(el, index)" class="result-chart"></div>
                </div>
                <el-divider />
              </div>
              <!-- 5. 总结 -->
              <div v-if="message.summary" class="answer-section">
                <div class="section-title">总结</div>
                <div class="section-content summary">
                  <div class="long-text-content">{{ message.summary }}</div>
                </div>
                <el-divider />
              </div>
              <!-- 6. 问题建议 -->
              <div v-if="message.suggestions" class="answer-section">
                <div class="section-title">相关问题</div>
                <div class="section-content suggestions">
                  <div class="related-questions">
                    <el-button 
                      v-for="(question, qIndex) in parseRelatedQuestions(message.suggestions)" 
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
                <div class="message-text">{{message.confirmMessage}}</div>
              </div>

            </div>

            <!-- 添加确认按钮组 -->
            <div v-if="message.role === 'assistant' && message.isConfirmation" class="confirm-actions">
                <el-button type="primary" size="small" @click="handleConfirmation(message)" plain>是的,保存至训练集</el-button>
                <el-button type="primary" size="small" @click="saveCommonFunc(message)" plain>保存为常用问题</el-button>
                <el-button type="danger" size="small" @click="incorrectFunc(message)" plain>不正确</el-button>
            </div>
          </div>
          <div v-if="message.role === 'sqlQuery' && sqlQueryVisible">
            <div class="message-content">
              <div class="message-text">请输入SQL：</div>
              <div style="margin-top: 10px;"><el-input
                v-model="inputSQL"
                type="textarea"
                :rows="5"
                placeholder="输入SQL"
              /></div>
              <div style="margin-top: 10px;"><el-button type="primary" size="small" @click="executeSQLFunc" :loading="loading">执行SQL</el-button></div>
            </div>
          </div>
          <!-- <div v-show="true">

          </div> -->
        </div>
      </div>

      <div class="input-main">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入您的问题..."
          @keyup.enter.ctrl="sendMessage"
        />
        <div class="input-actions">
          <div class="right-tools">
            <el-button type="primary" @click="sendMessage" :loading="loading">
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 不正确反馈对话框 -->

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
      <el-button class="save-btn" type="success" @click="saveCommonSubmitFunc()">保存</el-button>
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
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { Plus, ChatDotRound, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Plotly from 'plotly.js-dist'


// 加载状态
const loading = ref(false)
const inputMessage = ref('')  // 底部输入框内容

// 缓存字段
const latestQuestion = ref('')
const latestSQL = ref('')
const latestChartConfig = ref((''))

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTo({
        top: messageContainer.value.scrollHeight,
        behavior: 'smooth'
      })    
    }
  }, 100)
}

// 开始新对话
const startNewChat = () => {
  currentMessages.value = [{
    role: 'assistant',
    content: '你好！我是AI助手，有什么我可以帮你的吗？',
    confirmMessage: '',
    sqlThinkingProcess: '',
    sqlQuery: '',
    chartConfig: '',
    summary: '',
    suggestions: '',
    displaying: false
  }]
  inputMessage.value = ''
}
// 修改发送消息部分
const sendMessage = async () => {
  latestQuestion.value = inputMessage.value
  if (!inputMessage.value.trim()) return

  const userMessage = {
    role: 'user',
    content: inputMessage.value
  }
  currentMessages.value.push(userMessage)
  inputMessage.value = ''

  // 模拟AI响应
  loading.value = true
  setTimeout(() => {
    const aiResponse = {
      role: 'assistant', 
      content: '我是一个AI助手，可以帮助你解答问题！' ,
      confirmMessage: '生成的结果是否正确?',
      sqlThinkingProcess :'分析用户问题...',
      sqlQuery: 'SELECT...',
      chartConfig: {
        data: [{
          x: ['产品A', '产品B', '产品C', '产品D', '产品E'],
          y: [Math.random()*100, 100, 80, 70, 60],
          type: 'bar'
        }],
        layout: {
          title: "销售额统计",
          xaxis: { title: '产品名称' },
          yaxis: { title: "销售额" }
        }
      },
      summary: '根据查询结果，2023年销售额最高的产品是产品A，销售额为120万元，其次是产品B和产品C，销售额分别为100万元和80万元。前五名产品的销售总额占全年销售总额的65%。\n\n从数据分析来看，产品A的市场表现特别突出，比第二名产品B高出20%的销售额。这五款产品构成了公司主要的收入来源，其中前三名产品贡献了总销售额的近50%，显示出较高的产品集中度。\n\n值得注意的是，虽然产品D和产品E的销售额相对较低，但它们仍然进入了前五名',
      suggestions: '您可以进一步分析这些产品的月度销售趋势，或者查询这些产品在不同地区的销售情况，以便更全面地了解销售表现。\n\n以下是一些可能有价值的后续分析方向：\n\n1. 季节性分析：查看这些产品在不同季节的销售表现，识别是否存在季节性波动\n2. 客户细分：分析购买这些产品的客户类型，了解不同客户群体的偏好\n3. 价格敏感度：研究价格变动对这些产品销售量的影响',
      displaying: true,
      isConfirmation: true  // 添加标识
    }

    setTimeout(() => {
      nextTick(() => {
        try {
            if (chartRef.value) {
              Plotly.newPlot(chartRef.value, 
              aiResponse.chartConfig.data, 
              aiResponse.chartConfig.layout);
            }
          } catch (error) {
            console.error('图表渲染失败:', error);
          }
      });
    },400)

    // 延迟1秒后显示SQL生成思考过程
    loading.value = false

    latestSQL.value = aiResponse.sqlQuery
    latestChartConfig.value = JSON.stringify(aiResponse.chartConfig)
    currentMessages.value.push(aiResponse)
    scrollToBottom()
  }, 1000)
}

/**
 * 历史常用问题功能
 * @commonQueries 定义的常用问题数组
 * @chatHistory 历史常用问题
 * @loadCommonQuery 切换常用问题函数
 */
const commonQueries = ref([])
const chatHistory = commonQueries
const loadCommonQuery = (query) => {
  currentMessages.value = [{
    role: 'assistant',
    content: query.descrption,
    sqlQuery: query.executeSQL,
    chartConfig: query.chartConfig,
    isConfirmation: false
  }]
}
/**
 * 聊天功能
 * @currentMessages 聊天记录
 * @messageContainer 聊天记录容器
 * @currentChatId 当前聊天ID
 * @loading 加载状态
 */
const currentMessages = ref([
  { 
    role: 'assistant', 
    content: '你好！我是AI助手，有什么我可以帮你的吗？'
  }
])
const messageContainer = ref(null)
// const currentChatId = ref(1)

/**
 * 保存为常用问题功能
 * @commonQueryObj 定义的常用问题对象
 * @saveCommonVisible 保存为常用问题对话框的显示状态
 * @saveCommonFunc 保存为常用问题函数
 * @saveCommonSubmitFunc 保存为常用问题提交函数
 */
const commonQueryObj = ref({
  descrption: '',
  executeSQL: '',
  chartConfig: ''
})
const saveCommonVisible = ref(false)
const saveCommonFunc = (message) => {
  saveCommonVisible.value = true
  // console.log(message)
  commonQueryObj.value = {
    descrption: '',
    executeSQL: message.sqlQuery || '',
    chartConfig: message.chartConfig || ''
  }
}
const saveCommonSubmitFunc = () => {
  if(commonQueryObj.value.descrption.trim() === '') {
    ElMessage.error('请输入描述')
    return
  }
  // commonQueryObj.value.descrption = commonQueryObj.value.descrption.trim()
  // commonQueryObj.value.executeSQL = commonQueryObj.value.executeSQL.trim()
  commonQueries.value.push(commonQueryObj.value)
  saveCommonVisible.value = false
}


/**
 * 当用户觉得回答不正确时，提供用户输入SQL的功能
 * @sqlQueryVisible SQL输入框的显示状态
 * @inputSQL 用户输入的SQL
 * @incorrectFunc 不正确反馈函数
 * @executeSQLFunc 执行SQL函数
 */
const sqlQueryVisible = ref(false)
const inputSQL = ref('')
const incorrectFunc = (message) => {
  // console.log(message)
  if(!sqlQueryVisible.value) {
    sqlQueryVisible.value = true
    scrollToBottom()
    const userMessage = {
      role: 'sqlQuery',
      content: message.sqlQuery
    }
    inputSQL.value = message.sqlQuery
    currentMessages.value.push(userMessage)
  }
}
const executeSQLFunc = () => {
  if (!inputSQL.value.trim()) {
    ElMessage.error('请输入SQL')
    return
  }
  
  const userMessage = {
    role:'user',
    content: inputSQL.value
  }
  currentMessages.value.push(userMessage)
  sqlQueryVisible.value = false
  latestQuestion.value = inputSQL.value
  inputSQL.value = ''
  // 模拟AI响应
  loading.value = true
  setTimeout(() => {
    const aiResponse = {
      role: 'assistant', 
      content: '我是一个AI助手，可以帮助你解答问题！' ,
      confirmMessage: '生成的结果是否正确?',
      sqlThinkingProcess :'分析用户问题...',
      sqlQuery: 'SELECT...',
      chartConfig: {
        data: [{
          x: ['产品A', '产品B', '产品C', '产品D', '产品E'],
          y: [120, 100, 80, 70, 60]
        }],
        layout: {}
      },
      summary: '根据查询结果，2023年销售额最高的产品是产品A，销售额为120万元，其次是产品B和产品C，销售额分别为100万元和80万元。前五名产品的销售总额占全年销售总额的65%。\n\n从数据分析来看，产品A的市场表现特别突出，比第二名产品B高出20%的销售额。这五款产品构成了公司主要的收入来源，其中前三名产品贡献了总销售额的近50%，显示出较高的产品集中度。\n\n值得注意的是，虽然产品D和产品E的销售额相对较低，但它们仍然进入了前五名',
      suggestions: '您可以进一步分析这些产品的月度销售趋势，或者查询这些产品在不同地区的销售情况，以便更全面地了解销售表现。\n\n以下是一些可能有价值的后续分析方向：\n\n1. 季节性分析：查看这些产品在不同季节的销售表现，识别是否存在季节性波动\n2. 客户细分：分析购买这些产品的客户类型，了解不同客户群体的偏好\n3. 价格敏感度：研究价格变动对这些产品销售量的影响',
      displaying: true,
      isConfirmation: true  // 添加标识
    }

    setTimeout(() => {
      nextTick(() => {
        try {
            if (chartRef.value) {
              Plotly.newPlot(chartRef.value, 
              aiResponse.chartConfig.data, 
              aiResponse.chartConfig.layout);
            }
          } catch (error) {
            console.error('图表渲染失败:', error);
          }
      });
    },400)
    latestSQL.value = aiResponse.sqlQuery
    latestChartConfig.value = JSON.stringify(aiResponse.chartConfig)

    currentMessages.value.push(aiResponse)
    scrollToBottom()
    loading.value = false
    sqlQueryVisible.value = false
  }, 1000)
}


/**
 * 存储所有图表的 DOM 引用
 * @param {*} el 图表 DOM 引用
 * @chartRef  图表 DOM 引用
 * @bindPlotRef 绑定图表 DOM 引用
 */
const chartRef = ref([])
const bindPlotRef = (el, index) => {
  if (el) {
    chartRef.value = el
  }
};

/**
 * 解析问题建议为单独的问题列表
 * @param {*} suggestions 问题建议
 * @returns 问题列表
 * @askRelatedQuestion 相关问题点击事件
 */
const parseRelatedQuestions = (suggestions) => {
  if (!suggestions) return []
  
  // 尝试从文本中提取编号的问题
  const questionRegex = /\d+\.\s*([^\n]+)/g
  const matches = [...suggestions.matchAll(questionRegex)]
  
  if (matches.length > 0) {
    // 如果找到编号的问题，返回这些问题
    return matches.map(match => match[1].trim())
  } else {
    // 如果没有找到编号的问题，按换行符分割并过滤空行
    return suggestions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.includes('以下是') && !line.includes('可能有'))
      .slice(0, 3) // 限制最多显示3个问题
  }
}
const askRelatedQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

//保存至训练集
const handleConfirmation = (message) => {
  console.log('message', message)
  console.log('latestQuestion', latestQuestion.value)
  console.log('latestSQL', latestSQL.value)
  console.log('latestChartConfig', latestChartConfig.value)

}


onMounted(() => {
  scrollToBottom()
})

// 组件卸载时清理
onUnmounted(() => {
  // chartRef.value.forEach(chart => Plotly.purge(chart))
  // chartRef.value = []
})


// 监听消息变化
watch(currentMessages, (newVal) => {
  const lastMessage = newVal[newVal.length - 1]
  // if (lastMessage.role === 'assistant') {
  //   console.log('lastMessage', lastMessage)
  // }
  // if (lastMessage.role === 'assistant' && lastMessage.content !== '') {
  // }
  
}, { deep: true, immediate: true })
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  height: 100%;
  background-color: #f5f7fa;
}

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

.chat-history {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.history-header .el-button {
  width: 100%;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.history-item .el-icon {
  margin-right: 8px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

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


.message-actions {
  position: absolute;
  right: 8px;
  bottom: -24px;
  display: none;
}

.message-content:hover .message-actions {
  display: block;
}

.input-main {
  background-color: #e7e7e7;
  border-radius: 40px;
  padding: 20px;
}

.input-main :deep(.el-textarea__inner) {
  border: none;
  background-color: #e7e7e7;
  padding: 0;
  box-shadow: none;
  &:focus {
    box-shadow: none;
    outline: none;
  }
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
}

.right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn .el-button {
  color: #606266;
}

.upload-btn .el-icon {
  font-size: 20px;
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

.confirm-actions .el-button-group .el-button {
  margin: 0;
}

.ai-answer {
  padding: 0 20px;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 16px;
}

.answer-header .el-icon {
  color: #67c23a;
  font-size: 18px;
}

.time-info {
  margin-left: auto;
  font-size: 14px;
  color: #909399;
  font-weight: normal;
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

.thinking-process {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-line;
  max-height: 400px;
  overflow-y: auto;
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

.code-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
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

.el-divider {
  margin: 24px 0;
}

// .dialog-footer {
//   display: flex;
//   justify-content: flex-end;
//   gap: 10px;
//   margin-top: 20px;
// }
</style>