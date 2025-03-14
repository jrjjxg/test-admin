<template>
    <div class="image-uploader">
        <el-upload class="uploader" :action="uploadUrl" :show-file-list="false" :on-success="handleSuccess"
            :before-upload="beforeUpload" :http-request="customUpload">
            <img v-if="modelValue" :src="modelValue" class="uploaded-image">
            <div v-else class="upload-placeholder">
                <el-icon>
                    <Plus />
                </el-icon>
                <div class="upload-text">点击上传图片</div>
            </div>
        </el-upload>

        <div class="upload-tip">
            建议上传扁平化风格的SVG或PNG图片，尺寸不超过200KB
        </div>

        <div class="upload-actions" v-if="modelValue">
            <el-button type="primary" size="small" @click="$emit('save')">保存</el-button>
            <el-button size="small" @click="$emit('update:modelValue', '')">清除</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { testApi } from '@/api/test'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'save'])

// 自定义上传方法
const customUpload = async (options) => {
    try {
        const res = await testApi.uploadTestTypeImage(options.file)
        if (res.code === 200) {
            emit('update:modelValue', res.data)
            ElMessage.success('图片上传成功')
        } else {
            ElMessage.error(res.message || '图片上传失败')
        }
    } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('图片上传失败')
    }
}

// 图片上传前的验证
const beforeUpload = (file) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isSVG = file.type === 'image/svg+xml'
    const isLt200K = file.size / 1024 < 200

    if (!isJPG && !isPNG && !isSVG) {
        ElMessage.error('上传图片只能是 JPG/PNG/SVG 格式!')
        return false
    }
    if (!isLt200K) {
        ElMessage.error('上传图片大小不能超过 200KB!')
        return false
    }
    return true
}

// 上传成功处理
const handleSuccess = (response) => {
    if (response.code === 200) {
        emit('update:modelValue', response.data)
    }
}
</script>

<style scoped>
.image-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
}

.uploader:hover {
    border-color: #409EFF;
}

.uploaded-image {
    width: 178px;
    height: 178px;
    display: block;
    object-fit: cover;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #8c939d;
}

.upload-text {
    margin-top: 8px;
    font-size: 12px;
}

.upload-tip {
    font-size: 12px;
    color: #606266;
    margin-top: 8px;
    text-align: center;
}

.upload-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
}
</style>