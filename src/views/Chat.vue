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
      <div class="history-list">
        <div
          v-for="(chat, index) in chatHistory"
          :key="index"
          class="history-item"
          :class="{ active: currentChatId === chat.id }"
          @click="switchChat(chat.id)"
        >
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ chat.title }}</span>
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
          
          <div v-else>
            <div class="message-content">
              <div class="message-text">{{message.content}}</div>
            </div>
            <div class="ai-answer">
              <div v-show="false" class="answer-header">
                <el-icon><ChatDotRound /></el-icon>
                <span>AI助手</span>
                <span class="time-info">已完成思考 (用时 10 秒)</span>
              </div>

              <!-- 1. SQL思考过程 -->
              <div v-if="message.sqlThinkingProcess" class="answer-section">
                <div class="section-title">SQL生成思考过程</div>
                <div class="section-content thinking-process">
                  <div class="long-text-content">{{ message.sqlThinkingProcess }}</div>
                </div>
                <el-divider />
              </div>

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
              <div v-if="false" class="answer-section">
                <div class="section-title">图表展示</div>
                <div class="section-content chart-display">
                  <img :src="chartImage" alt="查询结果图表" class="result-chart" />
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
                <div class="section-title">问题建议</div>
                <div class="section-content suggestions">
                  <div class="long-text-content">{{ message.suggestions }}</div>
                </div>
              </div>
            </div>
            <!-- 添加确认按钮组 -->
            <div v-if="message.role === 'assistant' && message.isConfirmation" class="confirm-actions">
                <el-button type="primary" size="small" plain>是的,保存至训练集</el-button>
                <el-button type="primary" size="small" plain>保存为常用问题</el-button>
                <el-button type="danger" size="small" plain>不正确</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-toolbar">
          <div class="left-tools">
            <el-button type="text" class="toolbar-btn">
              <el-icon><ChatDotRound /></el-icon>
              快捷回复
            </el-button>
            <el-button type="text" class="toolbar-btn">
              <el-icon><Search /></el-icon>
              链接搜索
            </el-button>
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
              <el-upload
                class="upload-btn"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
              >
                <el-button type="text">
                  <el-icon><Upload /></el-icon>
                </el-button>
              </el-upload>
              <el-button type="primary" @click="sendMessage" :loading="loading">
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'  // 添加 watch 引入
import { Plus, ChatDotRound, CopyDocument, Edit, Search, Upload } from '@element-plus/icons-vue'

// 聊天历史记录
const chatHistory = ref([
  { id: 1, title: '今天' },
  { id: 2, title: '昨天' },
  { id: 3, title: '7 天内' }
])

// 当前聊天消息
const currentMessages = ref([
  { 
    role: 'assistant', 
    content: '你好！我是AI助手，有什么我可以帮你的吗？'
    
  }
])

const currentChatId = ref(1)
const inputMessage = ref('')
const loading = ref(false)
const messageContainer = ref(null)

// 开始新对话
const startNewChat = () => {
  currentMessages.value = [{
    role: 'assistant',
    content: '你好！我是AI助手，有什么我可以帮你的吗？',
    sqlThinkingProcess: '',
    sqlQuery: '',
    chartConfig: '',
    summary: '',
    suggestions: '',
    displaying: false
  }]
  inputMessage.value = ''
}

// 切换对话
const switchChat = (chatId) => {
  currentChatId.value = chatId
}

// 修改发送消息部分
const sendMessage = async () => {
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
      sqlThinkingProcess :'分析用户问题，确定需要查询的数据表和字段。根据问题描述，需要查询销售记录表中2023年的数据，按产品分组并计算销售总额，然后按销售额降序排列并限制结果为前5条记录。\n\n首先，我需要确定查询涉及的表：\n1. 销售记录表(sales)：包含销售日期(sale_date)和销售金额(amount)\n2. 产品表(products)：包含产品ID和产品名称(product_name)\n\n这两个表通过产品ID(product_id)关联。我需要：\n- 筛选2023年的销售记录\n- 按产品分组并计算每个产品的销售总额\n- 按销售总额降序排序\n- 只返回前5条记录\n\n这个查询需要使用JOIN操作连接两个表，使用SUM聚合函数计算销售总额，使用GROUP BY按产品分组，使用ORDER BY按销售额排序，最后使用LIMIT限制结果数量。',
      sqlQuery: 'ELECT p.product_name, SUM(s.amount) as total_sales\nFROM sales s\nJOIN products p ON s.product_id = p.id\nWHERE YEAR(s.sale_date) = 2023\nGROUP BY p.product_name\nORDER BY total_sales DESC\nLIMIT 10;',
      chartConfig: `{
        title: {
          text: '2023年销售额前五的产品'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: ['产品A', '产品B', '产品C', '产品D', '产品E']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [120, 100, 80, 70, 60],
          type: 'bar'
        }]
      }`,
      summary: '根据查询结果，2023年销售额最高的产品是产品A，销售额为120万元，其次是产品B和产品C，销售额分别为100万元和80万元。前五名产品的销售总额占全年销售总额的65%。\n\n从数据分析来看，产品A的市场表现特别突出，比第二名产品B高出20%的销售额。这五款产品构成了公司主要的收入来源，其中前三名产品贡献了总销售额的近50%，显示出较高的产品集中度。\n\n值得注意的是，虽然产品D和产品E的销售额相对较低，但它们仍然进入了前五名',
      suggestions: '您可以进一步分析这些产品的月度销售趋势，或者查询这些产品在不同地区的销售情况，以便更全面地了解销售表现。\n\n以下是一些可能有价值的后续分析方向：\n\n1. 季节性分析：查看这些产品在不同季节的销售表现，识别是否存在季节性波动\n2. 客户细分：分析购买这些产品的客户类型，了解不同客户群体的偏好\n3. 价格敏感度：研究价格变动对这些产品销售量的影响',
      displaying: true
    }
    currentMessages.value.push(aiResponse)

    // 添加确认消息
    setTimeout(() => {
      const confirmMessage = {
        role: 'assistant',
        content: '生成的结果是否正确?',
        displaying: true,
        isConfirmation: true  // 添加标识
      }
      currentMessages.value.push(confirmMessage)
      loading.value = false
      scrollToBottom()
    }, 2000) // 延迟1.5秒后显示确认消息
  }, 1000)
}

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }, 100)
}

onMounted(() => {
  scrollToBottom()
})


// 监听消息变化
watch(currentMessages, (newVal) => {
  const lastMessage = newVal[newVal.length - 1]
  console.log('lastMessage', lastMessage.content)
  // if (lastMessage.role === 'assistant' && lastMessage.content !== '') {
  // }
}, { deep: true, immediate: true })
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%;
  background-color: #f5f7fa;
}

.chat-history {
  width: 260px;
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

.message-actions {
  position: absolute;
  right: 8px;
  bottom: -24px;
  display: none;
}

.message-content:hover .message-actions {
  display: block;
}

.chat-input {
  background-color: #f2f3f5;
  border-radius: 8px;
  padding: 12px;
}

.input-toolbar {
  margin-bottom: 8px;
}

.left-tools {
  display: flex;
  gap: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.toolbar-btn .el-icon {
  font-size: 16px;
}

.input-main {
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
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
</style>