import request from '@/utils/request'

// 媒体资源相关API
export const mediaApi = {
  // 获取媒体分类列表
  getCategories(mediaType, pageNum = 1, pageSize = 10) {
    return request({
      url: '/api/admin/media/categories',
      method: 'GET',
      params: { mediaType, pageNum, pageSize }
    })
  },

  // 创建媒体分类
  createCategory(data) {
    return request({
      url: '/api/admin/media/category',
      method: 'POST',
      data
    })
  },

  // 更新媒体分类
  updateCategory(id, data) {
    return request({
      url: `/api/admin/media/category/${id}`,
      method: 'PUT',
      data
    })
  },

  // 删除媒体分类
  deleteCategory(id) {
    return request({
      url: `/api/admin/media/category/${id}`,
      method: 'DELETE'
    })
  },

  // 获取媒体资源列表
  getMediaResources(params) {
    return request({
      url: '/api/admin/media/resources',
      method: 'GET',
      params
    })
  },

  // 获取媒体资源详情
  getMediaDetail(id) {
    return request({
      url: `/api/admin/media/resource/${id}`,
      method: 'GET'
    })
  },

  // 上传媒体资源
  uploadMediaResource(formData) {
    return request({
      url: '/api/admin/media/resource/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 更新媒体资源信息
  updateMediaResource(id, data) {
    return request({
      url: `/api/admin/media/resource/${id}`,
      method: 'PUT',
      data
    })
  },

  // 删除媒体资源
  deleteMediaResource(id) {
    return request({
      url: `/api/admin/media/resource/${id}`,
      method: 'DELETE'
    })
  },

  // 更新媒体资源状态
  updateMediaStatus(id, status) {
    return request({
      url: `/api/admin/media/resource/status/${id}`,
      method: 'PUT',
      params: { status }
    })
  },

  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url: '/api/upload/image',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
} 