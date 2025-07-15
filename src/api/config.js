import request from '@/utils/request'

// 获取公司配置
export function getCompanyConfig(companyId) {
  return request({
    url: `/config/company/${companyId}`,
    method: 'get'
  })
} 