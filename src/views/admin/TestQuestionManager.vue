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
        <el-button type="primary" @click="showAddDialog" class="add-btn">
          添加题目
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
            <el-button size="small" type="success" @click="openImageUploadDialog(scope.row)">图片</el-button>
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑题目' : '添加题目'" width="60%" destroy-on-close
      :fullscreen="isSmallScreen" :close-on-click-modal="false" :append-to-body="true">
      <el-form ref="questionFormRef" :model="questionForm" :rules="rules" label-width="100px">
        <el-form-item label="题目内容" prop="content">
          <el-input v-model="questionForm.content" type="textarea" :rows="3" placeholder="请输入题目内容" clearable />
        </el-form-item>

        <el-form-item label="序号" prop="orderNum">
          <el-input-number v-model="questionForm.orderNum" :min="1" :max="100" controls-position="right"
            :precision="0" />
        </el-form-item>

        <el-form-item label="选项类型" prop="optionType">
          <el-radio-group v-model="questionForm.optionType">
            <el-radio :label="1">单选</el-radio>
            <el-radio :label="2">多选</el-radio>
            <el-radio :label="3">量表</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="选项">
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitQuestion">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { testApi } from '@/api/test'
import { useRouter } from 'vue-router'
import ImageUploader from '@/components/ImageUploader.vue'

// 获取路由实例
const router = useRouter()

// 数据定义
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedTestType = ref('')
const testTypes = ref([])
const questions = ref([])
const tableHeight = ref(500) // 默认高度

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

// 显示添加对话框
const showAddDialog = () => {
  if (!selectedTestType.value) {
    ElMessage.warning('请先选择测试类型')
    return
  }
  isEdit.value = false
  questionForm.id = ''
  questionForm.testTypeId = selectedTestType.value
  questionForm.content = ''
  questionForm.orderNum = questions.value.length + 1
  questionForm.optionType = 1
  questionForm.options = []

  // 先设置对话框可见
  dialogVisible.value = true

  // 使用nextTick确保DOM已更新
  nextTick(() => {
    // 如果需要，重置表单验证
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
  // 检查选项
  if (!questionForm.options.length) {
    ElMessage.warning('请至少添加一个选项')
    return
  }

  // 表单验证
  if (!questionFormRef.value) {
    console.error('表单引用不存在')
    return
  }

  questionFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善表单信息')
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
        options: questionForm.options.map((option, index) => ({
          ...option,
          orderNum: index + 1
        })),
        imageUrl: questionForm.imageUrl
      }

      console.log('提交题目数据:', submitData)
      const res = await testApi.saveQuestion(submitData)
      console.log('提交响应:', res)

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
    }
  })
}

// 测试类型变更
const handleTestTypeChange = (value) => {
  console.log('选择测试类型:', value)
  fetchQuestions(value)
}

// 页面加载
onMounted(() => {
  fetchTestTypes()
  calculateTableHeight() // 初始计算表格高度
  window.addEventListener('resize', handleResize) // 添加窗口大小变化监听
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
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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
</style>