<template>
    <div class="category-manager">
        <div class="page-header">
            <h2>测试分类管理</h2>
            <el-button type="primary" @click="openAddDialog">添加分类</el-button>
        </div>

        <!-- 分类列表表格 -->
        <el-table :data="categories" border style="width: 100%" v-loading="loading">
            <el-table-column prop="code" label="分类代码" width="120"></el-table-column>
            <el-table-column prop="name" label="分类名称" width="150"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="颜色标识" width="100">
                <template #default="scope">
                    <div class="color-block" :style="{ backgroundColor: scope.row.color }"></div>
                </template>
            </el-table-column>
            <el-table-column prop="displayOrder" label="排序" width="80"></el-table-column>
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                        {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="editCategory(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="confirmDeleteCategory(scope.row)"
                        :disabled="hasTestsWithCategory(scope.row.code)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加/编辑分类对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="500px" destroy-on-close>
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="分类代码" prop="code" :disabled="isEdit">
                    <el-input v-model="form.code" placeholder="请输入分类代码" :disabled="isEdit"></el-input>
                </el-form-item>
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入分类名称"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="form.description" placeholder="请输入描述" rows="3"></el-input>
                </el-form-item>
                <el-form-item label="颜色" prop="color">
                    <el-color-picker v-model="form.color"></el-color-picker>
                </el-form-item>
                <el-form-item label="排序" prop="displayOrder">
                    <el-input-number v-model="form.displayOrder" :min="0" :max="999"></el-input-number>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用"
                        inactive-text="禁用">
                    </el-switch>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { testApi } from '@/api/test'

// 状态变量
const loading = ref(false)
const submitLoading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const testsWithCategories = ref({}) // 存储每个分类下的测试数量

// 表单数据
const form = reactive({
    code: '',
    name: '',
    description: '',
    color: '#409EFF',
    displayOrder: 0,
    status: 1
})

// 表单验证规则
const rules = {
    code: [
        { required: true, message: '请输入分类代码', trigger: 'blur' },
        { pattern: /^[a-z0-9_]+$/, message: '分类代码只能包含小写字母、数字和下划线', trigger: 'blur' },
        { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
        { max: 200, message: '最多 200 个字符', trigger: 'blur' }
    ],
    color: [
        { required: true, message: '请选择颜色', trigger: 'change' }
    ],
    displayOrder: [
        { required: true, message: '请输入排序值', trigger: 'blur' }
    ]
}

// 加载分类列表
const loadCategories = async () => {
    loading.value = true
    try {
        const res = await testApi.getCategories()
        if (res.code === 200) {
            console.log('分类数据:', res.data)
            categories.value = res.data
            // 加载分类下的测试数量
            await loadTestCountsByCategory()
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

// 加载各分类下的测试数量
const loadTestCountsByCategory = async () => {
    try {
        const res = await testApi.getTestCountsByCategory()
        if (res.code === 200) {
            testsWithCategories.value = res.data
        }
    } catch (error) {
        console.error('获取分类测试数量失败:', error)
    }
}

// 判断分类是否有关联的测试
const hasTestsWithCategory = (categoryCode) => {
    return testsWithCategories.value[categoryCode] > 0
}

// 打开添加对话框
const openAddDialog = () => {
    isEdit.value = false
    Object.assign(form, {
        code: '',
        name: '',
        description: '',
        color: '#409EFF',
        displayOrder: 0,
        status: 1
    })
    dialogVisible.value = true
    nextTick(() => {
        formRef.value?.resetFields()
    })
}

// 打开编辑对话框
const editCategory = (row) => {
    isEdit.value = true
    Object.assign(form, {
        code: row.code,
        name: row.name,
        description: row.description,
        color: row.color || '#409EFF',
        displayOrder: row.displayOrder || 0,
        status: row.status
    })
    dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) return

        submitLoading.value = true
        try {
            let res
            if (isEdit.value) {
                res = await testApi.updateCategory(form)
            } else {
                res = await testApi.createCategory(form)
            }

            if (res.code === 200) {
                ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
                dialogVisible.value = false
                loadCategories()
            } else {
                ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
            }
        } catch (error) {
            console.error(isEdit.value ? '更新分类失败:' : '添加分类失败:', error)
            ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
        } finally {
            submitLoading.value = false
        }
    })
}

// 确认删除分类
const confirmDeleteCategory = (row) => {
    ElMessageBox.confirm(
        `确定要删除分类"${row.name}"吗？删除后无法恢复。`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        deleteCategory(row.code)
    }).catch(() => {
        // 用户取消删除
    })
}

// 删除分类
const deleteCategory = async (code) => {
    loading.value = true
    try {
        const res = await testApi.deleteCategory(code)
        if (res.code === 200) {
            ElMessage.success('删除成功')
            loadCategories()
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch (error) {
        console.error('删除分类失败:', error)
        ElMessage.error('删除失败')
    } finally {
        loading.value = false
    }
}

// 页面加载时获取数据
onMounted(() => {
    loadCategories()
})
</script>

<style scoped>
.category-manager {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.color-block {
    width: 30px;
    height: 20px;
    border-radius: 4px;
    margin: 0 auto;
}
</style>