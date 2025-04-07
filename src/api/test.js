import request from '@/utils/request'

// 测试相关的 API 接口
export const testApi = {
  // 获取所有测试类型
  getTestTypes() {
    return request({
      url: '/api/tests',
      method: 'GET'
    })
  },

  // 获取测试详情
  getTestDetail(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}`,
      method: 'GET'
    })
  },

  // 添加或更新测试类型
  saveTestType(data) {
    if (data.id) {
      // 更新
      return request({
        url: `/api/tests/types/${data.id}`,
        method: 'put',
        data
      })
    } else {
      // 添加
      return request({
        url: '/api/tests/types',
        method: 'post',
        data
      })
    }
  },

  // 删除测试类型
  deleteTestType(testTypeId) {
    return request({
      url: `/api/tests/types/${testTypeId}`,
      method: 'delete'
    })
  },

  // 更新测试类型图片
  updateTestTypeImage(testTypeId, imageUrl) {
    return request({
      url: `/api/tests/${testTypeId}/image`,
      method: 'put',
      data: { imageUrl }
    })
  },

  // 获取测试题目
  getTestQuestions(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}/questions`,
      method: 'get'
    })
  },

  // 保存测试题目
  saveQuestion(data) {
    return request({
      url: '/api/tests/questions',
      method: 'post',
      data
    })
  },

  // 删除测试题目
  deleteQuestion(questionId) {
    return request({
      url: `/api/tests/questions/${questionId}`,
      method: 'delete'
    })
  },

  // 获取测试详情
  getTestDetail(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}`,
      method: 'GET'
    })
  },

  // 提交测试答案
  submitTestAnswers(testTypeId, answers) {
    return request({
      url: `/api/tests/${testTypeId}/submit`,
      method: 'POST',
      data: answers
    })
  },
  // 获取用户测试历史
  getUserTestHistory(testTypeId = '') {
    return request({
      url: `/api/tests/history${testTypeId ? `?testTypeId=${testTypeId}` : ''}`,
      method: 'GET'
    })
  },
  
  // 获取测试结果详情
  getTestResultDetail(resultId) {
    return request({
      url: `/api/tests/results/${resultId}`,
      method: 'GET'
    })
  },

  // 上传测试类型图片
  uploadTestTypeImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return request({
      url: '/api/upload/image',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取选项模板列表
  getOptionTemplates() {
    return request({
      url: '/api/tests/option-templates',
      method: 'get'
    })
  },

  // 获取选项模板详情
  getOptionTemplateDetail(templateId) {
    return request({
      url: `/api/tests/option-templates/${templateId}`,
      method: 'get'
    })
  },

  // 保存选项模板
  saveOptionTemplate(data) {
    return request({
      url: '/api/tests/option-templates',
      method: 'post',
      data
    })
  },

  // 删除选项模板
  deleteOptionTemplate(templateId) {
    return request({
      url: `/api/tests/option-templates/${templateId}`,
      method: 'delete'
    })
  },

  // 使用模板创建题目
  createQuestionWithTemplate(templateId, data) {
    return request({
      url: `/api/tests/questions/with-template/${templateId}`,
      method: 'post',
      data
    })
  },

  // 获取测试分数等级列表
  getScoreLevels(testTypeId) {
    return request({
      url: `/api/admin/test/score-level/list/${testTypeId}`,
      method: 'get'
    })
  },

  // 创建测试分数等级
  createScoreLevel(data) {
    return request({
      url: '/api/admin/test/score-level/create',
      method: 'post',
      data
    })
  },

  // 更新测试分数等级
  updateScoreLevel(data) {
    return request({
      url: '/api/admin/test/score-level/update',
      method: 'put',
      data
    })
  },

  // 删除测试分数等级
  deleteScoreLevel(levelId) {
    return request({
      url: `/api/admin/test/score-level/delete/${levelId}`,
      method: 'delete'
    })
  },

  // 获取所有测试分类
  getCategories() {
    return request({
      url: '/api/tests/categories/list',
      method: 'get'
    })
  },

  // 创建测试分类
  createCategory(data) {
    return request({
      url: '/api/tests/categories',
      method: 'post',
      data
    })
  },

  // 更新测试分类
  updateCategory(data) {
    return request({
      url: `/api/tests/categories/${data.code}`,
      method: 'put',
      data
    })
  },

  // 删除测试分类
  deleteCategory(code) {
    return request({
      url: `/api/tests/categories/${code}`,
      method: 'delete'
    })
  },

  // 获取各分类下的测试数量
  getTestCountsByCategory() {
    return request({
      url: '/api/tests/categories/test-counts',
      method: 'get'
    })
  }
}