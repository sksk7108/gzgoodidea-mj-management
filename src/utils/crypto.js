/**
 * 简单的加密解密工具
 * 使用Base64和简单的位运算进行加密解密
 */

// 密钥，用于加密解密
const SECRET_KEY = 'MJ_ADMIN_2023'

/**
 * 加密字符串
 * @param {string} str 要加密的字符串
 * @returns {string} 加密后的字符串
 */
export function encrypt(str) {
  if (!str) return ''
  
  try {
    // 将字符串转换为字符数组
    const strChars = str.split('')
    const keyChars = SECRET_KEY.split('')
    const keyLen = keyChars.length
    
    // 对每个字符进行简单的异或运算
    const encryptedChars = strChars.map((char, index) => {
      const keyChar = keyChars[index % keyLen]
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
    })
    
    // 将加密后的字符数组转换为字符串，然后进行Base64编码
    const encryptedStr = encryptedChars.join('')
    return btoa(encryptedStr)
  } catch (error) {
    console.error('加密失败', error)
    return ''
  }
}

/**
 * 解密字符串
 * @param {string} encryptedStr 要解密的字符串
 * @returns {string} 解密后的字符串
 */
export function decrypt(encryptedStr) {
  if (!encryptedStr) return ''
  
  try {
    // 先进行Base64解码
    const decodedStr = atob(encryptedStr)
    const decodedChars = decodedStr.split('')
    const keyChars = SECRET_KEY.split('')
    const keyLen = keyChars.length
    
    // 对每个字符进行简单的异或运算（与加密相同的操作，因为异或运算具有可逆性）
    const decryptedChars = decodedChars.map((char, index) => {
      const keyChar = keyChars[index % keyLen]
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
    })
    
    return decryptedChars.join('')
  } catch (error) {
    console.error('解密失败', error)
    return ''
  }
}

/**
 * 保存用户凭证到本地存储
 * @param {string} username 用户名
 * @param {string} password 密码
 */
export function saveCredentials(username, password) {
  const credentials = {
    username,
    password
  }
  
  try {
    const encryptedCredentials = encrypt(JSON.stringify(credentials))
    localStorage.setItem('remember_credentials', encryptedCredentials)
  } catch (error) {
    console.error('保存凭证失败', error)
  }
}

/**
 * 从本地存储获取用户凭证
 * @returns {Object|null} 用户凭证对象，包含username和password字段
 */
export function getCredentials() {
  try {
    const encryptedCredentials = localStorage.getItem('remember_credentials')
    if (!encryptedCredentials) return null
    
    const credentialsStr = decrypt(encryptedCredentials)
    return JSON.parse(credentialsStr)
  } catch (error) {
    console.error('获取凭证失败', error)
    return null
  }
}

/**
 * 清除保存的用户凭证
 */
export function clearCredentials() {
  localStorage.removeItem('remember_credentials')
} 