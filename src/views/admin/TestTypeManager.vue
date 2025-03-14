<!-- test-admin/src/views/admin/TestTypeManager.vue -->
<template>
    <div class="test-type-manager">
        <div class="page-header">
            <h2>测试类型管理</h2>
            <el-button type="primary" @click="openAddDialog">添加测试类型</el-button>
        </div>

        <!-- 测试类型表格 -->
        <el-table :data="testTypes" :height="tableHeight" border style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="测试名称" width="180"></el-table-column>
            <el-table-column prop="category" label="分类" width="120">
                <template #default="scope">
                    <el-tag :type="getCategoryTagType(scope.row.category)" effect="plain">
                        {{ getCategoryLabel(scope.row.category) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="图片" width="100">
                <template #default="scope">
                    <el-image v-if="scope.row.imageUrl" :src="scope.row.imageUrl" style="width: 50px; height: 50px;"
                        fit="cover" :preview-src-list="[scope.row.imageUrl]">
                        <template #error>
                            <div class="image-error">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                    <el-button v-else size="small" type="info" plain>无图片</el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
                <template #default="scope">
                    <el-dropdown trigger="click">
                        <el-button type="primary" size="small">
                            操作<el-icon class="el-icon--right">
                                <ArrowDown />
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="editTestType(scope.row)">
                                    <el-icon>
                                        <Edit />
                                    </el-icon> 编辑
                                </el-dropdown-item>
                                <el-dropdown-item @click="manageQuestions(scope.row)">
                                    <el-icon>
                                        <Document />
                                    </el-icon> 题目管理
                                </el-dropdown-item>
                                <el-dropdown-item @click="openImageUploadDialog(scope.row)">
                                    <el-icon>
                                        <Picture />
                                    </el-icon> 上传图片
                                </el-dropdown-item>
                                <el-dropdown-item @click="confirmDeleteTestType(scope.row)" class="danger-item" divided>
                                    <el-icon>
                                        <Delete />
                                    </el-icon> 删除
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>

        <!-- 图片上传对话框 -->
        <el-dialog v-model="imageUploadDialogVisible" title="上传测试类型图片" width="400px" :close-on-click-modal="false"
            destroy-on-close>
            <div class="image-upload-container">
                <ImageUploader v-model="currentImage" />
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="imageUploadDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveImage" :loading="uploadLoading">保存</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 添加/编辑测试类型对话框 -->
        <el-dialog v-model="testTypeDialogVisible" :title="isEdit ? '编辑测试类型' : '添加测试类型'" width="500px"
            :close-on-click-modal="false" destroy-on-close>
            <el-form :model="testTypeForm" :rules="testTypeRules" ref="testTypeFormRef" label-width="100px" status-icon>
                <el-form-item label="测试名称" prop="name">
                    <el-input v-model="testTypeForm.name" placeholder="请输入测试名称"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category">
                    <el-select v-model="testTypeForm.category" placeholder="请选择分类" style="width: 100%">
                        <el-option label="通用测试" value="common"></el-option>
                        <el-option label="情绪测试" value="emotion"></el-option>
                        <el-option label="人格测试" value="personality"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="testTypeForm.description" type="textarea" rows="3"
                        placeholder="请输入测试描述"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="testTypeDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitTestType" :loading="submitLoading">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { testApi } from '@/api/test'
import ImageUploader from '@/components/ImageUploader.vue'
import { ArrowDown, Edit, Document, Picture, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const testTypes = ref([])
const tableHeight = ref('400px')
const loading = ref(false)
const uploadLoading = ref(false)
const submitLoading = ref(false)

// 图片上传相关
const imageUploadDialogVisible = ref(false)
const currentImage = ref('')
const currentTestType = ref(null)

// 测试类型表单相关
const testTypeDialogVisible = ref(false)
const isEdit = ref(false)
const testTypeFormRef = ref(null)
const testTypeForm = reactive({
    id: '',
    name: '',
    category: '',
    description: ''
})

// 表单验证规则
const testTypeRules = {
    name: [
        { required: true, message: '请输入测试名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择分类', trigger: 'change' }
    ],
    description: [
        { required: true, message: '请输入测试描述', trigger: 'blur' }
    ]
}

// 获取分类标签类型
const getCategoryTagType = (category) => {
    const types = {
        common: 'info',
        emotion: 'success',
        personality: 'warning'
    }
    return types[category] || 'info'
}

// 获取分类显示名称
const getCategoryLabel = (category) => {
    const labels = {
        common: '通用测试',
        emotion: '情绪测试',
        personality: '人格测试'
    }
    return labels[category] || category
}

// 计算表格高度，使其适应屏幕
const calculateTableHeight = () => {
    // 减去页面头部、页面边距等高度
    const windowHeight = window.innerHeight
    tableHeight.value = (windowHeight - 180) + 'px'
}

// 窗口大小变化处理
const handleResize = () => {
    calculateTableHeight()
}

// 加载测试类型列表
const loadTestTypes = async () => {
    loading.value = true
    try {
        const res = await testApi.getTestTypes()
        if (res.code === 200) {
            testTypes.value = res.data
        } else {
            ElMessage.error(res.message || '获取测试类型失败')
        }
    } catch (error) {
        console.error('获取测试类型失败:', error)
        ElMessage.error('获取测试类型失败')
    } finally {
        loading.value = false
    }
}

// 打开图片上传对话框
const openImageUploadDialog = (testType) => {
    currentTestType.value = testType
    currentImage.value = testType.imageUrl || ''
    imageUploadDialogVisible.value = true
}

// 保存测试类型图片
const saveImage = async () => {
    if (!currentTestType.value || !currentImage.value) {
        ElMessage.warning('请先上传图片')
        return
    }

    uploadLoading.value = true
    try {
        // 如果是base64图片，需要先上传
        if (currentImage.value.startsWith('data:image')) {
            // 将base64转换为文件对象
            const base64Data = currentImage.value.split(',')[1]
            const blob = atob(base64Data)
            const array = []
            for (let i = 0; i < blob.length; i++) {
                array.push(blob.charCodeAt(i))
            }
            const file = new File([new Uint8Array(array)], 'image.png', { type: 'image/png' })

            // 上传图片
            const uploadRes = await testApi.uploadTestTypeImage(file)
            if (uploadRes.code === 200) {
                currentImage.value = uploadRes.data
            } else {
                ElMessage.error(uploadRes.message || '上传图片失败')
                return
            }
        }

        // 保存图片URL到测试类型
        const res = await testApi.updateTestTypeImage(currentTestType.value.id, currentImage.value)

        if (res.code === 200) {
            ElMessage.success('保存图片成功')
            // 更新本地数据
            const index = testTypes.value.findIndex(item => item.id === currentTestType.value.id)
            if (index !== -1) {
                testTypes.value[index].imageUrl = currentImage.value
            }
            imageUploadDialogVisible.value = false
        } else {
            ElMessage.error(res.message || '保存图片失败')
        }
    } catch (error) {
        console.error('保存图片失败:', error)
        ElMessage.error('保存图片失败')
    } finally {
        uploadLoading.value = false
    }
}

// 管理测试题目
const manageQuestions = (testType) => {
    router.push({
        name: 'TestQuestionManager',
        query: { testTypeId: testType.id }
    })
}

// 打开添加测试类型对话框
const openAddDialog = () => {
    isEdit.value = false
    testTypeForm.id = ''
    testTypeForm.name = ''
    testTypeForm.category = ''
    testTypeForm.description = ''
    testTypeDialogVisible.value = true

    // 等待DOM更新后重置表单验证
    nextTick(() => {
        testTypeFormRef.value?.resetFields()
    })
}

// 打开编辑测试类型对话框
const editTestType = (testType) => {
    isEdit.value = true
    testTypeForm.id = testType.id
    testTypeForm.name = testType.name
    testTypeForm.category = testType.category
    testTypeForm.description = testType.description
    testTypeDialogVisible.value = true
}

// 提交测试类型表单
const submitTestType = async () => {
    if (!testTypeFormRef.value) return

    await testTypeFormRef.value.validate(async (valid) => {
        if (!valid) return

        submitLoading.value = true
        try {
            const res = await testApi.saveTestType({
                id: testTypeForm.id,
                name: testTypeForm.name,
                category: testTypeForm.category,
                description: testTypeForm.description
            })

            if (res.code === 200) {
                ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
                testTypeDialogVisible.value = false
                loadTestTypes() // 重新加载列表
            } else {
                ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
            }
        } catch (error) {
            console.error(isEdit.value ? '更新测试类型失败:' : '添加测试类型失败:', error)
            ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
        } finally {
            submitLoading.value = false
        }
    })
}

// 确认删除测试类型
const confirmDeleteTestType = (testType) => {
    ElMessageBox.confirm(
        `确定要删除测试类型"${testType.name}"吗？删除后将无法恢复，且相关的测试题目也会被删除。`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        deleteTestType(testType.id)
    }).catch(() => {
        // 用户取消删除
    })
}

// 删除测试类型
const deleteTestType = async (testTypeId) => {
    try {
        loading.value = true
        const res = await testApi.deleteTestType(testTypeId)

        if (res.code === 200) {
            ElMessage.success('删除成功')
            loadTestTypes() // 重新加载列表
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error) {
        console.error('删除测试类型失败:', error)
        ElMessage.error('删除失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadTestTypes()
    calculateTableHeight()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.test-type-manager {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-header h2 {
    margin: 0;
}

/* 确保表格占据剩余空间 */
.el-table {
    flex: 1;
}

/* 图片上传容器样式 */
.image-upload-container {
    display: flex;
    justify-content: center;
    padding: 10px;
}

/* 图片错误状态 */
.image-error {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
}

:deep(.danger-item) {
    color: #f56c6c;
}

:deep(.el-dropdown-menu__item:focus),
:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
    background-color: #f5f7fa;
}

:deep(.el-dropdown-menu__item i) {
    margin-right: 5px;
}
</style>