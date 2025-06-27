import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 聊天消息列表
    currentMessages: [
      { 
        role: 'assistant', 
        content: '你好！我是AI助手，有什么我可以帮你的吗？'
      }
    ],
    // 常用问题列表
    commonQueries: [],
    // 显示设置
    displaySettings: {
      showSqlQuery: true,
      showSqlResult: true,
      showChartConfig: true,
      showChart: true,
      showSummary: true,
      showSuggestions: true
    },
    // 加载状态
    loading: false,
    // 输入消息
    inputMessage: '',
    // SQL查询相关
    sqlQueryVisible: false,
    inputSQL: '',
    // 缓存字段
    latestQuestion: '',
    latestSQL: '',
    latestChartConfig: '',
    // 保存常用问题相关
    saveCommonVisible: false,
    commonQueryObj: {
      descrption: '',
      executeSQL: '',
      chartConfig: ''
    },
    // 数据表格显示状态
    dataTableVisible: false
  }),
  
  actions: {
    // 添加用户消息
    addUserMessage(content) {
      this.latestQuestion = content
      if (!content.trim()) return

      const userMessage = {
        role: 'user',
        content: content
      }
      this.currentMessages.push(userMessage)
      this.inputMessage = ''
    },
    
    // 添加AI响应
    addAIResponse(response) {
      this.currentMessages.push(response)
      this.latestSQL = response.sqlQuery || ''
      this.latestChartConfig = response.chartConfig ? JSON.stringify(response.chartConfig) : ''
    },
    
    // 开始新对话
    startNewChat() {
      this.currentMessages = [{
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
      this.inputMessage = ''
    },
    
    // 加载常用问题
    loadCommonQuery(query) {
      this.currentMessages = [{
        role: 'assistant',
        content: query.descrption,
        sqlQuery: query.executeSQL,
        chartConfig: query.chartConfig,
        isConfirmation: false
      }]
    },
    
    // 保存为常用问题
    saveCommonFunc(message) {
      this.saveCommonVisible = true
      this.commonQueryObj = {
        descrption: '',
        executeSQL: message.sqlQuery || '',
        chartConfig: message.chartConfig || ''
      }
    },
    
    // 提交保存常用问题
    saveCommonSubmitFunc() {
      if(this.commonQueryObj.descrption.trim() === '') {
        return false
      }
      this.commonQueries.push(this.commonQueryObj)
      this.saveCommonVisible = false
      return true
    },
    
    // 不正确反馈
    incorrectFunc(message) {
      if(!this.sqlQueryVisible) {
        this.sqlQueryVisible = true
        const userMessage = {
          role: 'sqlQuery',
          content: message.sqlQuery
        }
        this.inputSQL = message.sqlQuery
        this.currentMessages.push(userMessage)
      }
    },
    
    // 执行SQL
    executeSQLFunc() {
      if (!this.inputSQL.trim()) {
        return false
      }
      
      const userMessage = {
        role:'user',
        content: this.inputSQL
      }
      this.currentMessages.push(userMessage)
      this.sqlQueryVisible = false
      this.latestQuestion = this.inputSQL
      this.inputSQL = ''
      return true
    },
    
    // 解析相关问题
    parseRelatedQuestions(suggestions) {
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
    },
    
    // 提问相关问题
    askRelatedQuestion(question) {
      this.inputMessage = question
      // 这里不直接调用sendMessage，因为组件会监听inputMessage变化
    },
    
    // 更新显示设置
    updateDisplaySettings(settings) {
      this.displaySettings = { ...this.displaySettings, ...settings }
    },
    
    // 删除常用问题
    deleteCommonQuery(index) {
      this.commonQueries.splice(index, 1)
    },
    
    // 编辑常用问题
    editCommonQuery(query, index) {
      this.commonQueryObj = { ...query }
      this.saveCommonVisible = true
      // 保存索引，用于更新
      this.editingIndex = index
    }
  }
})