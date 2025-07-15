// 公司配置工具函数

const STORE_COMPANY_ID = 'store_company_id'

const STORE_CONFIG_KEY = 'store_company_config'

/**
 * 从URL中获取公司ID
 * @returns {string|null} 公司ID
 */
export function getCompanyIdFromUrl() {
  const companyId = localStorage.getItem(STORE_COMPANY_ID)
  if(companyId){
    return companyId
  }
  // 从URL路径获取
  const path = window.location.pathname
  const matches = path.match(/\/login\/(MJ-\d+)/) || path.match(/\/(MJ-\d+)/)
  return matches ? matches[1].toUpperCase() : null
}

/**
 * 保存公司ID到本地存储
 * @param {string} companyId 公司ID
 */
export function saveCompanyId(companyId) {
  if (companyId) {
    localStorage.setItem(STORE_COMPANY_ID, companyId)
  }
}

/**
 * 清除保存的公司ID
 */
export function clearCompanyId() {
  localStorage.removeItem(STORE_COMPANY_ID)
} 

/**
 * 清除保存的公司配置
 */
export function clearCompanyConfig(){
  localStorage.removeItem(STORE_CONFIG_KEY)
}