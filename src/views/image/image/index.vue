<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务ID" prop="taskId">
        <el-input
          v-model="queryParams.taskId"
          placeholder="请输入任务ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品ID" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="卫星名称" prop="satellite">
        <el-input
          v-model="queryParams.satellite"
          placeholder="请输入卫星名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['image:image:import']"
        >上传</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['image:image:edit']"
        >修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['image:image:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['image:image:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="imageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务ID" align="center" prop="taskId" />
      <el-table-column label="产品ID" align="center" prop="productId" width="170">
        <template #default="scope">
          <el-tooltip
            effect="dark"
            :content="scope.row.productId"
            placement="top"
          >
            <span class="ellipsis">
              {{ scope.row.productId?.length > 10
                ? scope.row.productId.substring(0, 10) + '...'
                : scope.row.productId
              }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="卫星名称" align="center" prop="satellite" />
      <el-table-column label="传感器" align="center" prop="sensor" />
      <el-table-column label="产品类型" align="center" prop="productType" />
      <el-table-column label="成像时间 (UTC)" align="center" prop="imagingTime" width="210">
        <template #default="scope">
          <span>
            {{ parseTime(scope.row.imagingTime, '{y}-{m}-{d} {h}:{i}:{s}') }} (UTC)
          </span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="生成时间" align="center" prop="produceTime" width="210">
        <template #default="scope">
          <span>
            {{ parseTime(scope.row.produceTime, '{y}-{m}-{d} {h}:{i}:{s}') }} (UTC)
          </span>
        </template>
      </el-table-column> -->
      <el-table-column label="影像宽(px)" align="center" prop="widthPixels" />
      <el-table-column label="影像高(px)" align="center" prop="heightPixels" />
      <el-table-column label="云量(%)" align="center" prop="cloudPercent" />
      <el-table-column label="中心纬度" align="center" prop="centerLat" />
      <el-table-column label="中心经度" align="center" prop="centerLon" />
      <el-table-column label="拇指图" align="center" width="120">
        <template #default="scope">
          <el-image
            :src="scope.row.thumbUrl"
            fit="cover"
            style="width: 80px; height: 80px"
            :preview-src-list="[scope.row.thumbUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['image:image:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改遥感图像信息管理对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="680px"
      append-to-body
    >
      <el-alert
        title="遥感数据上传说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 15px"
      >
        <template #default>
          请上传<strong>遥感数据压缩包（zip）</strong>，压缩包内应包含遥感影像数据文件及其对应的元数据文件（如XML或TXT格式）。上传后系统将自动解析并提取相关信息进行存储。
        </template>
      </el-alert>

      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :limit="1"
        accept=".zip"
        :auto-upload="true"
        :before-upload="beforeUpload"
        :http-request="handleUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
      >
        <el-icon style="font-size: 60px">
          <UploadFilled />
        </el-icon>

        <div class="el-upload__text">
          将 <strong>zip 压缩包</strong> 拖拽到此处<br />
          或 <em>点击选择文件</em>
        </div>

        <template #tip>
          <div class="el-upload__tip">
            只能上传<strong>zip</strong>格式的文件
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Image">
import { listImage, getImage, delImage, addImage, updateImage, uploadFile } from "@/api/image/image"

const { proxy } = getCurrentInstance()

const imageList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    taskId: null,
    productId: null,
    satellite: null,
    productType: null,
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

const uploadRef = ref(null) // 声明 ref
const uploadedData = ref([])  // 暂存后端返回的数据

/** 查询遥感图像信息管理列表 */
function getList() {
  loading.value = true
  listImage(queryParams.value).then(response => {
    imageList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  uploadedData.value = null
  if (uploadRef.value) uploadRef.value.clearFiles()
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    taskId: null,
    productId: null,
    satellite: null,
    sensor: null,
    productLevel: null,
    productType: null,
    imagingTime: null,
    produceTime: null,
    bands: null,
    wavelengthNm: null,
    fwhmNm: null,
    gsdMeter: null,
    dataBits: null,
    widthPixels: null,
    heightPixels: null,
    cloudPercent: null,
    centerLat: null,
    centerLon: null,
    ulLat: null,
    ulLon: null,
    urLat: null,
    urLon: null,
    lrLat: null,
    lrLon: null,
    llLat: null,
    llLon: null,
    solarAzimuth: null,
    solarElevation: null,
    satelliteAzimuth: null,
    satelliteElevation: null,
    roll: null,
    pitch: null,
    yaw: null
  }
  proxy.resetForm("imageRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加遥感图像信息"

  uploadedData.value = null          // 清空上一次上传的数据
  if (uploadRef.value) {
    uploadRef.value.clearFiles()     // 清空文件列表
  }
}

import { ElMessage } from 'element-plus'
/** 上传文件操作 */
function handleUpload(options) {
  const { file } = options
  uploadFile(file)
    .then(res => {
      ElMessage.success("上传成功")
      handleSuccess(res, file)
    })
    .catch(err => {
      ElMessage.error("上传失败")
      handleError(err, file)
    })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getImage(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改遥感图像信息"
  })
}

/** 提交按钮 */
function submitForm() {
  if (uploadedData.value) {
    // 通过接口提交到表项
    addImage(uploadedData.value).then(res => {
      ElMessage.success("添加成功")
      open.value = false
      getList()  // 刷新表格
      uploadedData.value = null  // 清空暂存
    }).catch(err => {
      ElMessage.error("添加失败")
    })
  } else {
    ElMessage.warning("请先上传文件")
  }
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除遥感图像信息编号为"' + _ids + '"的数据项？').then(function() {
    return delImage(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('image/image/export', {
    ...queryParams.value
  }, `image_${new Date().getTime()}.xlsx`)
}

// 上传成功
function handleSuccess(response, file, list) {
  console.log('上传成功:', response)
  uploadedData.value = response.data  // 暂存后端返回的数据
}

// 上传失败
function handleError(err, file, list) {
  console.error('上传失败:', err, file, list)
  uploadedData.value = null
  if (uploadRef.value) uploadRef.value.clearFiles()
}

// 上传前检查文件大小
function beforeUpload(file) {
  const isLt2GB = file.size / 1024 / 1024 < 2048;
  if (!isLt2GB) {
    ElMessage.warning("文件过大，请上传小于 2GB 的文件");
  }
  return isLt2GB;
}


getList()
</script>
