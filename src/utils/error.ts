import { ElMessage } from 'element-plus'

export function handleError(error: any, message: string = '操作失败') {
  console.error(error)
  ElMessage.error({
    message: error.response?.data?.detail || message,
    duration: 5000
  })
}
