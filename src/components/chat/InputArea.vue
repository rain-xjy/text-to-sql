<template>
  <div class="input-main">
    <el-input
      v-model="inputMessage"
      type="textarea"
      :rows="3"
      placeholder="输入您的问题..."
      @keyup.enter.ctrl="sendMessage"
    />
    <div class="input-actions">
      <el-dropdown trigger="click" @command="handleDisplaySettings" :hide-on-click="false">
        <el-button type="primary">
          显示设置
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-checkbox v-model="displaySettings.showSqlQuery">生成SQL思考过程</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="displaySettings.showSqlResult">显示SQL查询结果</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="displaySettings.showChartConfig">显示图表配置</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="displaySettings.showChart">显示图表</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="displaySettings.showSummary">显示总结</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="displaySettings.showSuggestions">显示建议</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="primary" @click="sendMessage" :loading="loading">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { CaretBottom } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { inputMessage, displaySettings, loading } = storeToRefs(chatStore)

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  chatStore.addUserMessage(inputMessage.value)
  
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
      isConfirmation: true
    }
    
    // 添加AI响应
    chatStore.addAIResponse(aiResponse)
    loading.value = false
  }, 1000)
}

// 处理显示设置
const handleDisplaySettings = () => {
  console.log('显示设置已更新')
}
</script>

<style scoped lang="scss">
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
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
</style>