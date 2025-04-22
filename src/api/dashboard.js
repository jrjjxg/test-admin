import request from '@/utils/request'

/**
 * 获取看板统计数据
 * @returns {Promise<Object>} 统计数据
 */
export const getDashboardStats = () => {
  return request({
    url: '/api/admin/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取看板趋势数据
 * @param {Number} days 天数
 * @returns {Promise<Object>} 趋势数据
 */
export const getDashboardTrends = (days = 7) => {
  return request({
    url: '/api/admin/dashboard/trends',
    method: 'get',
    params: { days }
  })
} 