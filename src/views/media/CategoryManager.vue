<template>
    <div class="category-manager">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>媒体分类管理</span>
                    <div class="header-actions">
                        <el-radio-group v-model="currentMediaType" @change="handleMediaTypeChange">
                            <el-radio-button :label="1">视频分类</el-radio-button>
                            <el-radio-button :label="2">音频分类</el-radio-button>
                        </el-radio-group>
                        <el-button type="primary" @click="openAddDialog">添加分类</el-button>
                    </div>
                </div>
            </template>

            <!-- 分类列表 -->
            <el-table v-loading="loading" :data="categoryList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="280" />
                <el-table-column prop="name" label="分类名称" width="180" />
                <el-table-column label="图标" width="120">
                    <template #default="scope">
                        <el-image v-if="scope.row.icon" :src="scope.row.icon" style="width: 40px; height: 40px"
                            fit="contain" />
                        <span v-else>无</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="100" />
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 添加/编辑分类对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="500px">
            <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
                </el-form-item>

                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="categoryForm.sort" :min="0" :max="999"></el-input-number>
                </el-form-item>

                <el-form-item label="图标">
                    <el-upload class="icon-uploader" action="#" :http-request="handleIconUpload" :show-file-list="false"
                        accept="image/png,image/jpeg,image/svg+xml">
                        <img v-if="categoryForm.icon" :src="categoryForm.icon" class="icon-image" />
                        <el-icon v-else class="icon-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">建议上传正方形图标，不超过200KB</div>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { mediaApi } from '@/api/media'

// 数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentMediaType = ref(1) // 默认视频分类
const categoryList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const categoryFormRef = ref(null)

const categoryForm = reactive({
    id: '',
    name: '',
    icon: '',
    sort: 0,
    mediaType: 1
})

const rules = {
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    sort: [
        { required: true, message: '请输入排序', trigger: 'blur' }
    ]
}

// 生命周期钩子
onMounted(() => {
    fetchCategoryList()
})

// 方法
const fetchCategoryList = async () => {
    loading.value = true
    try {
        const res = await mediaApi.getCategories(
            currentMediaType.value,
            currentPage.value,
            pageSize.value
        )

        if (res.code === 200) {
            categoryList.value = res.data.records || []
            total.value = res.data.total || 0
        } else {
            ElMessage.error(res.message || '获取分类列表失败')
        }
    } catch (error) {
        console.error('获取分类列表失败:', error)
        ElMessage.error('获取分类列表失败')
    } finally {
        loading.value = false
    }
}

const handleMediaTypeChange = () => {
    currentPage.value = 1
    fetchCategoryList()
}

const handleSizeChange = (val) => {
    pageSize.value = val
    fetchCategoryList()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchCategoryList()
}

const resetForm = () => {
    categoryForm.id = ''
    categoryForm.name = ''
    categoryForm.icon = ''
    categoryForm.sort = 0

    if (categoryFormRef.value) {
        categoryFormRef.value.resetFields()
    }
}

const openAddDialog = () => {
    isEdit.value = false
    resetForm()
    categoryForm.mediaType = currentMediaType.value
    dialogVisible.value = true
}

const openEditDialog = (row) => {
    isEdit.value = true
    resetForm()

    categoryForm.id = row.id
    categoryForm.name = row.name
    categoryForm.icon = row.icon
    categoryForm.sort = row.sort
    categoryForm.mediaType = row.mediaType || currentMediaType.value

    dialogVisible.value = true
}

const handleIconUpload = async (options) => {
    try {
        const res = await mediaApi.uploadImage(options.file)

        if (res.code === 200) {
            categoryForm.icon = res.data
            ElMessage.success('图标上传成功')
        } else {
            ElMessage.error(res.message || '图标上传失败')
        }
    } catch (error) {
        console.error('上传图标失败:', error)
        ElMessage.error('上传图标失败')
    }
}

const submitForm = async () => {
    if (!categoryFormRef.value) return

    await categoryFormRef.value.validate(async (valid) => {
        if (!valid) return

        submitting.value = true
        try {
            let res
            if (isEdit.value) {
                res = await mediaApi.updateCategory(categoryForm.id, categoryForm)
            } else {
                res = await mediaApi.createCategory(categoryForm)
            }

            if (res.code === 200) {
                ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
                dialogVisible.value = false
                fetchCategoryList()
            } else {
                ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
            }
        } catch (error) {
            console.error(isEdit.value ? '更新分类失败:' : '添加分类失败:', error)
            ElMessage.error(isEdit.value ? '更新分类失败' : '添加分类失败')
        } finally {
            submitting.value = false
        }
    })
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确定要删除分类 "${row.name}" 吗？删除后不可恢复。`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
        .then(async () => {
            try {
                const res = await mediaApi.deleteCategory(row.id)

                if (res.code === 200) {
                    ElMessage.success('删除成功')
                    fetchCategoryList()
                } else {
                    ElMessage.error(res.message || '删除失败')
                }
            } catch (error) {
                console.error('删除分类失败:', error)
                ElMessage.error('删除分类失败')
            }
        })
        .catch(() => {
            // 用户取消删除操作
        })
}
</script>

<style scoped>
.category-manager {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    gap: 16px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.icon-uploader {
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
}

.icon-uploader:hover {
    border-color: #409EFF;
}

.icon-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.icon-image {
    width: 100px;
    height: 100px;
    display: block;
    object-fit: contain;
}

.upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
}
</style>