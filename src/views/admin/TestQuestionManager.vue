<!-- views/admin/TestQuestionManager.vue -->
<template>
  <div class="test-question-manager">
    <!-- 页面标题区 -->
    <div class="section-header">
      <div class="section-title">
        <div class="blue-line"></div>
        <span>测试题目管理</span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="operation-container">
      <div class="operation-bar">
        <el-select v-model="selectedTestType" placeholder="选择测试类型" class="select-box" @change="handleTestTypeChange">
          <el-option v-for="item in testTypes" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <!-- 添加模板选择器 -->
        <el-select v-model="selectedTemplate" placeholder="选择选项模板" class="select-box"
          @change="handleGlobalTemplateChange">
          <el-option v-for="item in optionTemplates" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <el-button type="primary" @click="showAddDialog" class="add-btn">
          添加题目
        </el-button>

        <el-button type="info" @click="showTemplateManager" class="add-btn">
          管理模板
        </el-button>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="table-container">
      <el-table :data="questions" border style="width: 100%" v-loading="loading" element-loading-text="加载中..."
        :height="tableHeight">
        <el-table-column prop="orderNum" label="序号" width="80" align="center" />
        <el-table-column prop="content" label="题目内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="optionType" label="选项类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getOptionTypeTag(scope.row.optionType)">
              {{ getOptionTypeName(scope.row.optionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="选项" width="100" align="center">
          <template #default="scope">
            <el-button size="small" type="info" @click="viewOptions(scope.row)">
              查看选项
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" class="edit-btn" @click="editQuestion(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" class="delete-btn" @click="deleteQuestion(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空数据状态 -->
      <el-empty v-if="!loading && questions.length === 0" description="暂无题目数据">
        <el-button v-if="selectedTestType" type="primary" @click="showAddDialog">
          添加第一道题目
        </el-button>
        <el-button v-else type="info" @click="() => { }">
          请先选择测试类型
        </el-button>
      </el-empty>
    </div>

    <!-- 添加/编辑题目对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" append-to-body destroy-on-close>
      <el-form :model="questionForm" :rules="rules" ref="questionFormRef" label-width="80px">
        <!-- 题目内容字段保持不变 -->
        <el-form-item label="题目内容" prop="content">
          <el-input v-model="questionForm.content" type="textarea" :rows="4" placeholder="请输入题目内容" />
        </el-form-item>

        <!-- 其他字段如序号、选项类型等 -->
        <el-form-item label="序号" prop="orderNum">
          <el-input-number v-model="questionForm.orderNum" :min="1" :max="999" controls-position="right" />
        </el-form-item>

        <el-form-item label="选项类型">
          <el-radio-group v-model="questionForm.optionType">
            <el-radio :label="1">单选</el-radio>
            <el-radio :label="2">多选</el-radio>
            <el-radio :label="3">量表</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 选项模板选择部分 -->
        <el-form-item label="选项模板">
          <div class="template-selector">
            <el-select v-model="selectedTemplate" placeholder="选择选项模板" clearable @change="handleTemplateChangeInDialog">
              <el-option v-for="item in optionTemplates" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <el-button type="text" @click="showTemplateManager">管理模板</el-button>
          </div>
          
          <!-- 显示当前使用的模板 -->
          <div v-if="selectedTemplate && templatePreview.length > 0" class="template-options-preview">
            <div v-for="(option, index) in templatePreview" :key="index" class="template-option-item">
              <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
              <div class="option-content">{{ option.content }}</div>
              <div class="option-score">分值: {{ option.score }}</div>
            </div>
          </div>
        </el-form-item>

        <!-- 无论是编辑模式还是添加模式，如果没有使用模板都可以编辑选项 -->
        <el-form-item label="选项" v-if="!selectedTemplate || isEdit">
          <div class="options-container">
            <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
              <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
              <el-input v-model="option.content" placeholder="选项内容" class="option-content" clearable />
              <el-input-number v-model="option.score" :min="0" :max="100" placeholder="分值" class="option-score"
                controls-position="right" :precision="0" />
              <el-button type="danger" circle @click="removeOption(index)" class="option-delete">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
            <el-button type="primary" plain @click="addOption" class="add-option-btn">
              <el-icon>
                <Plus />
              </el-icon>添加选项
            </el-button>
          </div>
        </el-form-item>

        <!-- 底部按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitQuestion" :loading="submitLoading">提交</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 选项模板管理器 -->
    <option-template-manager v-model:visible="templateManagerVisible" :testTypeId="selectedTestType"
      @templates-updated="handleTemplatesUpdated" @template-selected="handleTemplateSelected" />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { testApi } from '@/api/test'
import { useRouter } from 'vue-router'
import ImageUploader from '@/components/ImageUploader.vue'
import OptionTemplateManager from '@/components/OptionTemplateManager.vue'

// 获取路由实例
const router = useRouter()

// 数据定义
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加题目')
const isEdit = ref(false)
const submitLoading = ref(false)
const selectedTestType = ref('')
const testTypes = ref([])
const questions = ref([])
const tableHeight = ref(500) // 默认高度
const currentTemplateName = ref('')
const templateManagerVisible = ref(false)
const templatePreview = ref([])
const selectedTemplate = ref('')
const optionTemplates = ref([])

// 计算是否是小屏幕
const isSmallScreen = computed(() => {
  return window.innerWidth < 768
})

// 计算表格高度
const calculateTableHeight = () => {
  // 窗口高度减去其他元素的高度（标题、操作栏、页面padding等）
  const windowHeight = window.innerHeight
  const otherElementsHeight = 280 // 估算其他元素的总高度，包括Layout的header
  tableHeight.value = windowHeight - otherElementsHeight
}

// 监听窗口大小变化
const handleResize = () => {
  calculateTableHeight()
}

// 表单数据
const questionForm = reactive({
  id: '',
  testTypeId: '',
  content: '',
  orderNum: 1,
  optionType: 1,
  options: [],
  imageUrl: ''
})

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入题目内容', trigger: 'blur' },
    { min: 2, max: 500, message: '长度在 2 到 500 个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入序号', trigger: 'blur' }
  ],
  optionType: [
    { required: true, message: '请选择选项类型', trigger: 'change' }
  ]
}

// 添加表单引用
const questionFormRef = ref(null)

// 获取测试类型列表
const fetchTestTypes = async () => {
  loading.value = true
  try {
    const res = await testApi.getTestTypes()
    console.log('测试类型响应:', res)
    testTypes.value = res.data || []
  } catch (error) {
    console.error('获取测试类型失败:', error)
    ElMessage.error('获取测试类型失败')
  } finally {
    loading.value = false
  }
}

// 获取题目列表
const fetchQuestions = async (testTypeId) => {
  if (!testTypeId) return
  loading.value = true
  try {
    const res = await testApi.getTestQuestions(testTypeId)
    console.log('题目列表响应:', res)

    if (res.code === 200) {
      questions.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表失败')
  } finally {
    loading.value = false
  }
}

// 选项类型名称
const getOptionTypeName = (type) => {
  const types = {
    1: '单选',
    2: '多选',
    3: '量表'
  }
  return types[type] || '未知'
}

// 选项类型标签样式
const getOptionTypeTag = (type) => {
  const types = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return types[type] || ''
}

// 查看选项
const viewOptions = (row) => {
  if (!row.options || row.options.length === 0) {
    ElMessage.info('该题目暂无选项')
    return
  }

  let content = `<div style="max-height: 300px; overflow-y: auto;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background-color: #f5f7fa;">
        <th style="padding: 8px; border: 1px solid #dcdfe6;">选项</th>
        <th style="padding: 8px; border: 1px solid #dcdfe6;">内容</th>
        <th style="padding: 8px; border: 1px solid #dcdfe6;">分值</th>
      </tr>`

  row.options.forEach((option, index) => {
    content += `<tr>
      <td style="padding: 8px; border: 1px solid #dcdfe6;">${String.fromCharCode(65 + index)}</td>
      <td style="padding: 8px; border: 1px solid #dcdfe6;">${option.content}</td>
      <td style="padding: 8px; border: 1px solid #dcdfe6;">${option.score}</td>
    </tr>`
  })

  content += `</table></div>`

  ElMessageBox.alert(content, '题目选项', {
    dangerouslyUseHTMLString: true,
    customClass: 'option-dialog'
  })
}

// 添加选项
const addOption = () => {
  questionForm.options.push({
    content: '',
    score: 0,
    orderNum: questionForm.options.length + 1
  })
}

// 删除选项
const removeOption = (index) => {
  questionForm.options.splice(index, 1)
}

// 获取选项模板列表
const fetchOptionTemplates = async () => {
  try {
    const res = await testApi.getOptionTemplates()
    if (res.code === 200) {
      optionTemplates.value = res.data || []
    }
  } catch (error) {
    console.error('获取选项模板失败:', error)
  }
}

// 处理全局模板选择变更
const handleGlobalTemplateChange = async (templateId) => {
  if (!templateId) {
    templatePreview.value = []
    currentTemplateName.value = ''
    return
  }

  try {
    const res = await testApi.getOptionTemplateDetail(templateId)
    if (res.code === 200 && res.data) {
      templatePreview.value = res.data.options || []
      currentTemplateName.value = res.data.name || '未命名模板'
    }
  } catch (error) {
    console.error('获取模板详情失败:', error)
    ElMessage.error('获取模板详情失败')
  }
}

// 显示添加题目对话框
const showAddDialog = () => {
  // 检查是否选择了测试类型
  if (!selectedTestType.value) {
    ElMessage.warning('请先选择一个测试类型')
    return
  }

  isEdit.value = false
  dialogTitle.value = '添加题目'

  // 重置表单
  questionForm.id = ''
  questionForm.testTypeId = selectedTestType.value
  questionForm.content = ''
  questionForm.orderNum = questions.value.length + 1
  questionForm.optionType = 1
  questionForm.optionTemplateId = selectedTemplate.value // 可选的模板ID

  // 如果选择了模板，使用模板选项
  if (selectedTemplate.value && templatePreview.value && templatePreview.value.length > 0) {
    questionForm.options = JSON.parse(JSON.stringify(templatePreview.value || []))
  } else {
    // 如果没有选择模板，创建空的选项列表
    questionForm.options = [
      { content: '', score: 0, orderNum: 1 },
      { content: '', score: 0, orderNum: 2 },
      { content: '', score: 0, orderNum: 3 },
      { content: '', score: 0, orderNum: 4 }
    ]
  }

  dialogVisible.value = true

  // 使用nextTick确保DOM已更新
  nextTick(() => {
    if (questionFormRef.value) {
      questionFormRef.value.resetFields()
    }
  })
}

// 编辑题目
const editQuestion = (row) => {
  console.log('编辑题目:', row)
  isEdit.value = true

  // 使用深拷贝避免直接修改原始数据
  questionForm.id = row.id
  questionForm.testTypeId = row.testTypeId
  questionForm.content = row.content
  questionForm.orderNum = row.orderNum
  questionForm.optionType = row.optionType

  // 确保选项是新数组，避免引用问题
  questionForm.options = row.options ? JSON.parse(JSON.stringify(row.options)) : []

  // 先设置对话框可见
  dialogVisible.value = true

  // 使用nextTick确保DOM已更新
  nextTick(() => {
    // 如果需要，重置表单验证
    if (questionFormRef.value) {
      questionFormRef.value.clearValidate()
    }
  })
}

// 删除题目
const deleteQuestion = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这道题目吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })

    console.log('删除题目:', row.id)
    const res = await testApi.deleteQuestion(row.id)
    console.log('删除响应:', res)

    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchQuestions(selectedTestType.value)
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除题目失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交题目
const submitQuestion = async () => {
  if (!questionFormRef.value) {
    console.error('表单引用不存在')
    return
  }

  submitLoading.value = true
  questionFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善表单信息')
      submitLoading.value = false
      return
    }

    try {
      // 准备提交数据
      const submitData = {
        id: questionForm.id || undefined,
        testTypeId: questionForm.testTypeId,
        content: questionForm.content,
        orderNum: questionForm.orderNum,
        optionType: questionForm.optionType,
        imageUrl: questionForm.imageUrl
      }

      // 仅当有选择模板时才添加模板ID
      if (selectedTemplate.value) {
        submitData.optionTemplateId = selectedTemplate.value
      }

      // 如果是编辑模式或者没有使用模板，添加选项数据
      if (isEdit.value || !selectedTemplate.value) {
        submitData.options = questionForm.options.map((option, index) => ({
          ...option,
          orderNum: index + 1
        }))
      } else if (selectedTemplate.value && templatePreview.value) {
        // 如果使用了模板，使用模板的选项
        submitData.options = templatePreview.value
      }

      const res = await testApi.saveQuestion(submitData)

      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        dialogVisible.value = false
        fetchQuestions(selectedTestType.value)
      } else {
        ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
      }
    } catch (error) {
      console.error('保存题目失败:', error)
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 测试类型变更
const handleTestTypeChange = (value) => {
  console.log('选择测试类型:', value)
  fetchQuestions(value)
}

// 显示模板管理器
const showTemplateManager = () => {
  templateManagerVisible.value = true
}

// 处理模板更新
const handleTemplatesUpdated = () => {
  fetchOptionTemplates()
}

// 处理模板选择
const handleTemplateSelected = (template) => {
  selectedTemplate.value = template.id
  templatePreview.value = template.options || []
  questionForm.options = JSON.parse(JSON.stringify(template.options))
}

// 处理模板选择变更
const handleTemplateChangeInDialog = async () => {
  if (!selectedTemplate.value) {
    // 清空模板预览，但保留现有选项
    templatePreview.value = []
    return
  }

  try {
    const res = await testApi.getOptionTemplateDetail(selectedTemplate.value)
    if (res.code === 200 && res.data) {
      templatePreview.value = res.data.options || []
      // 更新问题表单的选项为模板选项
      questionForm.options = JSON.parse(JSON.stringify(res.data.options || []))
    }
  } catch (error) {
    console.error('获取模板详情失败:', error)
    ElMessage.error('获取模板详情失败')
  }
}

// 页面加载
onMounted(() => {
  fetchTestTypes()
  fetchOptionTemplates()
  calculateTableHeight()
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize) // 移除监听
})
</script>

<style scoped>
.test-question-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  box-sizing: border-box;
  overflow: hidden;
}

/* 页面标题样式 */
.section-header {
  flex-shrink: 0;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.blue-line {
  width: 4px;
  height: 20px;
  background-color: #409eff;
  margin-right: 8px;
}

/* 操作栏样式 */
.operation-container {
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.operation-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.select-box {
  width: 150px;
}

.add-btn {
  background-color: #409eff;
}

/* 表格容器样式 */
.table-container {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 表格样式 */
:deep(.el-table) {
  flex: 1;
  overflow: auto;
}

/* 表格按钮样式 */
.edit-btn {
  margin-right: 8px;
}

/* 选项容器样式 */
.options-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9fafc;
  max-height: 400px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.option-label {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-score {
  width: 120px;
  flex-shrink: 0;
}

.option-delete {
  flex-shrink: 0;
}

.add-option-btn {
  margin-top: 10px;
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .test-question-manager {
    padding: 10px;
  }

  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .select-box {
    width: 100%;
  }

  .add-btn {
    width: 100%;
  }

  .option-item {
    flex-wrap: wrap;
  }

  .option-content {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-table) {
  --el-table-header-bg-color: #f5f7fa;
  --el-table-row-hover-bg-color: #ecf5ff;
}

:deep(.el-table__header th) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-button--primary) {
  --el-button-hover-bg-color: #66b1ff;
}

/* 空状态居中显示 */
:deep(.el-empty) {
  margin: auto;
}

/* 选项对话框样式 */
:global(.option-dialog .el-message-box__body) {
  padding: 10px;
  max-width: 600px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.image-upload-container {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.template-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.template-options-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.template-option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-bottom: 1px dashed #ebeef5;
}

.template-option-item:last-child {
  border-bottom: none;
}

.option-label {
  width: 30px;
  text-align: center;
  font-weight: bold;
}

.option-content {
  flex: 1;
}

.option-score {
  width: 80px;
  text-align: right;
  color: #606266;
}

.template-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.template-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.template-edit-header {
  margin-bottom: 20px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-option-btn {
  margin-top: 10px;
  align-self: flex-start;
}

.current-template {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>