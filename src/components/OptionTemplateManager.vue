<template>
    <div class="option-template-manager">
        <el-dialog v-model="dialogVisible" title="选项模板管理" width="70%" destroy-on-close>
            <div class="template-dialog-content">
                <div class="template-list">
                    <div class="template-list-header">
                        <h3>模板列表</h3>
                        <el-button type="primary" @click="createNewTemplate">新建模板</el-button>
                    </div>
                    <el-table :data="templates" border style="width: 100%" height="300" v-loading="loading">
                        <el-table-column prop="name" label="模板名称" min-width="120" />
                        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
                        <el-table-column label="选项数量" width="100" align="center">
                            <template #default="scope">
                                {{ scope.row.options ? scope.row.options.length : 0 }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180" align="center">
                            <template #default="scope">
                                <el-button type="primary" size="small" @click="editTemplate(scope.row)">编辑</el-button>
                                <el-button type="danger" size="small" @click="deleteTemplate(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <div class="template-edit" v-if="templateForm.visible">
                    <div class="template-edit-header">
                        <h3>{{ templateForm.isEdit ? '编辑模板' : '新建模板' }}</h3>
                    </div>
                    <el-form ref="templateFormRef" :model="templateForm" :rules="templateRules" label-width="100px">
                        <el-form-item label="模板名称" prop="name">
                            <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
                        </el-form-item>
                        <el-form-item label="模板描述" prop="description">
                            <el-input v-model="templateForm.description" type="textarea" :rows="2"
                                placeholder="请输入模板描述" />
                        </el-form-item>
                        <el-form-item label="选项">
                            <div class="options-container">
                                <div v-for="(option, index) in templateForm.options" :key="index" class="option-item">
                                    <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                                    <el-input v-model="option.content" placeholder="选项内容" class="option-content"
                                        clearable />
                                    <el-input-number v-model="option.score" :min="0" :max="100" placeholder="分值"
                                        class="option-score" controls-position="right" :precision="0" />
                                    <el-button type="danger" circle @click="removeTemplateOption(index)"
                                        class="option-delete">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </el-button>
                                </div>
                                <el-button type="primary" plain @click="addTemplateOption" class="add-option-btn">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>添加选项
                                </el-button>
                            </div>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitTemplate">保存模板</el-button>
                            <el-button @click="cancelTemplateEdit">取消</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { testApi } from '@/api/test'

const props = defineProps({
    visible: Boolean,
    testTypeId: String
})

const emit = defineEmits(['update:visible', 'template-selected', 'templates-updated'])

const dialogVisible = ref(false)
const templates = ref([])
const loading = ref(false)
const templateFormRef = ref(null)

const templateForm = reactive({
    visible: false,
    isEdit: false,
    id: '',
    name: '',
    description: '',
    testTypeId: '',
    options: []
})

const templateRules = {
    name: [
        { required: true, message: '请输入模板名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
}

// 监听props.visible变化
watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
        loadTemplates()
    }
})

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
    emit('update:visible', newVal)
})

// 加载模板列表
const loadTemplates = async () => {
    loading.value = true
    try {
        const res = await testApi.getOptionTemplates(props.testTypeId)
        templates.value = res.data
    } catch (error) {
        console.error('加载选项模板失败:', error)
        ElMessage.error('加载选项模板失败')
    } finally {
        loading.value = false
    }
}

// 创建新模板
const createNewTemplate = () => {
    templateForm.visible = true
    templateForm.isEdit = false
    templateForm.id = ''
    templateForm.name = ''
    templateForm.description = ''
    templateForm.testTypeId = props.testTypeId
    templateForm.options = []
}

// 编辑模板
const editTemplate = (template) => {
    templateForm.visible = true
    templateForm.isEdit = true
    templateForm.id = template.id
    templateForm.name = template.name
    templateForm.description = template.description
    templateForm.testTypeId = template.testTypeId
    templateForm.options = template.options ? [...template.options] : []
}

// 删除模板
const deleteTemplate = (template) => {
    ElMessageBox.confirm(
        `确定要删除模板 "${template.name}" 吗？`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            await testApi.deleteOptionTemplate(template.id)
            ElMessage.success('删除成功')
            loadTemplates()
            emit('templates-updated')
        } catch (error) {
            console.error('删除模板失败:', error)
            ElMessage.error('删除模板失败: ' + (error.response?.data?.message || error.message))
        }
    }).catch(() => { })
}

// 添加选项
const addTemplateOption = () => {
    templateForm.options.push({
        content: '',
        score: 0
    })
}

// 移除选项
const removeTemplateOption = (index) => {
    templateForm.options.splice(index, 1)
}

// 提交模板
const submitTemplate = async () => {
    if (!templateFormRef.value) return

    await templateFormRef.value.validate(async (valid) => {
        if (!valid) return

        // 验证选项
        if (templateForm.options.length === 0) {
            ElMessage.warning('请至少添加一个选项')
            return
        }

        for (const option of templateForm.options) {
            if (!option.content) {
                ElMessage.warning('选项内容不能为空')
                return
            }
        }

        try {
            const templateData = {
                id: templateForm.id,
                name: templateForm.name,
                description: templateForm.description,
                testTypeId: templateForm.testTypeId,
                options: templateForm.options
            }

            const res = await testApi.saveOptionTemplate(templateData)
            ElMessage.success(templateForm.isEdit ? '更新成功' : '创建成功')
            templateForm.visible = false
            loadTemplates()
            emit('templates-updated')
            emit('template-selected', res.data)
        } catch (error) {
            console.error('保存模板失败:', error)
            ElMessage.error('保存模板失败: ' + (error.response?.data?.message || error.message))
        }
    })
}

// 取消编辑
const cancelTemplateEdit = () => {
    templateForm.visible = false
}

// 初始加载
onMounted(() => {
    if (props.visible) {
        loadTemplates()
    }
})
</script>

<style scoped>
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

.option-label {
    width: 30px;
    text-align: center;
    font-weight: bold;
}

.option-content {
    flex: 1;
}

.option-score {
    width: 120px;
}

.add-option-btn {
    margin-top: 10px;
    align-self: flex-start;
}
</style>