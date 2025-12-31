import request from '@/utils/request'

// 查询遥感图像信息管理列表
export function listImage(query) {
  return request({
    url: '/image/image/list',
    method: 'get',
    params: query
  })
}

// 查询遥感图像信息管理详细
export function getImage(id) {
  return request({
    url: '/image/image/' + id,
    method: 'get'
  })
}

// 新增遥感图像信息管理
export function addImage(data) {
  return request({
    url: '/image/image',
    method: 'post',
    data: data
  })
}

// 上传遥感图像文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/image/image/importZip',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 修改遥感图像信息管理
export function updateImage(data) {
  return request({
    url: '/image/image',
    method: 'put',
    data: data
  })
}

// 删除遥感图像信息管理
export function delImage(id) {
  return request({
    url: '/image/image/' + id,
    method: 'delete'
  })
}

// 获取遥感图像统计数据
export function getImageStat() {
  return request({
    url: '/image/image/statistics',
    method: 'get'
  })
}