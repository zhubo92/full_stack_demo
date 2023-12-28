<template>
  <div class="box">
    <div class="boxTop">
      <div class="addBtn">
        <div>
          <el-button
            style="margin-right: 12px"
            size="small"
            plain
            type="primary"
            @click="addData"
            >+新增数据</el-button
          >
        </div>
        <el-tooltip
          class="item"
          effect="dark"
          content="请勾选以后再导出"
          placement="top-start"
          :disabled="multipleSelection.length > 0"
        >
          <span>
            <el-button
              style="margin-right: 12px"
              size="small"
              :disabled="multipleSelection.length <= 0"
              plain
              type="primary"
              @click="exportExcel"
              >导出勾选数据</el-button
            >
          </span>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="请勾选以后再批量删除"
          placement="top-start"
          :disabled="multipleSelection.length > 0"
        >
          <span>
            <el-button
              size="small"
              :disabled="multipleSelection.length <= 0"
              plain
              type="primary"
              @click="selectDelete"
              >勾选删除</el-button
            >
          </span>
        </el-tooltip>
        <div>
          <el-button
            style="margin-left: 12px"
            size="small"
            type="primary"
            plain
            @click="downloadTemp"
            >下载模板数据</el-button
          >
        </div>
        <el-upload
          class="avatar-uploader"
          :action="upLoadUrl"
          :show-file-list="false"
          accept=".xlsx"
          :before-upload="beforeExcelUpload"
          :on-error="upLoadError"
          :on-success="upLoadSuccess"
        >
          <el-button style="margin-left: 12px" size="small" type="primary" plain
            >上传数据</el-button
          >
        </el-upload>
      </div>
      <div class="inputs">
        <el-input
          size="small"
          placeholder="搜索姓名/家乡/备注"
          clearable
          v-model.trim="Pages.searchWord"
          @keyup.enter.native="confirmSearch"
        ></el-input>
        <el-button size="small" type="primary" @click="confirmSearch">确认搜索</el-button>
      </div>
    </div>
    <!-- 新增弹框部分 -->
    <add-dialog
      :isShowAddDialog.sync="isShowAddDialog"
      @confirmAdd="confirmAdd"
      title="新增数据"
    ></add-dialog>
    <!-- 编辑弹框部分 -->
    <edit-dialog
      v-if="isShowEditDialog"
      :isShowEditDialog.sync="isShowEditDialog"
      title="编辑数据"
      :rowData="rowData"
      @confirmEdit="confirmEdit"
    ></edit-dialog>
    <div class="boxBottom">
      <!-- 表格部分 -->
      <div class="elTableWrap">
        <el-table
          :data="tableData"
          border
          height="100%"
          :header-cell-style="{
            height: '48px',
            background: '#FAFAFA',
            color: '#333333',
            fontWeight: 'bold',
            fontSize: '14px',
            width: '100%',
            'white-space': 'nowrap',
          }"
          @sort-change="sortChange"
          @selection-change="handleSelectionChange"
          :row-key="getRowKey"
        >
          <el-table-column type="selection" width="45"> </el-table-column>
          <el-table-column
            type="index"
            label="序号"
            width="50"
            :index="indexMethod"
          ></el-table-column>
          <el-table-column
            v-for="(item, index) in tableHeader"
            :key="index"
            :prop="item.propName"
            :label="item.labelName"
            sortable="custom"
          ></el-table-column>
          <el-table-column align="center" label="操作" width="180">
            <template slot-scope="scope">
              <el-button
                type="danger"
                size="small"
                plain
                @click="deleteRowData(scope.row)"
                >删除</el-button
              >
              <el-button type="primary" size="small" plain @click="editRowData(scope.row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页部分 -->
      <div class="elPaginations">
        <el-pagination layout="slot" :total="Pages.total">
          <span class="leftPagination"
            >共{{ Pages.total }}条记录，第{{ Pages.pageIndex }}/{{
              Math.ceil(Pages.total / Pages.pageSize)
            }}页面</span
          >
        </el-pagination>
        <el-pagination
          style="color: #757575"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
          :current-page="Pages.pageIndex"
          :page-sizes="[3, 4, 6, 12]"
          :page-size="Pages.pageSize"
          layout="prev, pager, next, sizes, jumper"
          :total="Pages.total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import addDialog from "./components/addDialog.vue";
import editDialog from "./components/editDialog.vue";
export default {
  components: {
    addDialog,
    editDialog,
  },
  data() {
    return {
      // 表头数据
      tableHeader: [
        {
          propName: "name",
          labelName: "姓名",
        },
        {
          propName: "age",
          labelName: "年龄",
        },
        {
          propName: "home",
          labelName: "家乡",
        },
        {
          propName: "remark",
          labelName: "备注",
        },
      ],
      // 表体数据
      tableData: [
        // {
        //   name: "孙悟空",
        //   age: 500,
        //   home: "花果山水帘洞",
        //   remark: "备注",
        // },
      ],
      // 分页排序数据
      Pages: {
        pageIndex: 1,
        pageSize: 6, // 默认每页6条
        total: 0,
        sortWord: "id", // 默认 id降序
        sortOrder: "DESC", // "ASC"
        searchWord: "",
      },
      // 打开新增弹框
      isShowAddDialog: false,
      // 打开编辑弹出框
      isShowEditDialog: false,
      // 点击编辑按钮，获取当前行的数据
      rowData: null,
      // 勾选用于导出
      multipleSelection: [],
      // 上传的地址
      upLoadUrl: "/api" + "/uploadExcel",
    };
  },
  watch: {
    "Pages.searchWord": {
      // 监听一下
      handler: function (newnew, oldold) {
        if (newnew == "") {
          this.getTableData();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    // 获取表体数据和总条目数数据
    async getTableData() {
      this.tableData = [];
      const loading = this.$loading({
        // 开启数据加载效果
        lock: true,
        text: "数据加载中...",
        spinner: "el-icon-loading",
        background: "rgba(255,255,255,.5)",
      });
      let params = {
        pageIndex: this.Pages.pageIndex,
        pageSize: this.Pages.pageSize,
        sortWord: this.Pages.sortWord,
        sortOrder: this.Pages.sortOrder,
        searchWord: this.Pages.searchWord,
      };
      const res = await this.$api.getTableData(params);
      this.tableData = res.data;
      loading.close(); // 关闭数据加载效果
      const count = await this.$api.getTotalCount({ searchWord: this.Pages.searchWord });
      this.Pages.total = count.data;
    },
    // 确认搜索
    confirmSearch() {
      if (this.Pages.searchWord == "") {
        this.$message({
          type: "warning",
          message: "请输入内容以后再搜索",
        });
      } else {
        this.getTableData();
      }
    },
    // 页数改变
    handleCurrentChange(val) {
      this.Pages.pageIndex = val;
      this.getTableData();
    },
    // 条目数改变
    handleSizeChange(val) {
      this.Pages.pageIndex = 1;
      this.Pages.pageSize = val;
      this.getTableData();
    },
    // 添加数据
    addData() {
      this.isShowAddDialog = true;
    },
    // 确认新增数据
    async confirmAdd(params) {
      const res = await this.$api.addData(params);
      console.log("新增接口", res);
      if (res.code == 0) {
        this.isShowAddDialog = false;
        this.$message({
          type: "success",
          message: res.data,
        });
        this.getTableData();
      }
    },
    // 删除数据
    async deleteRowData(row) {
      let params = {
        id: row.id,
      };
      const res = await this.$api.deleteData(params);
      console.log("删除", res);
      this.$message({
        type: "success",
        message: res.data,
      });
      this.getTableData();
    },
    // 批量删除
    async selectDelete() {
      let ids = this.multipleSelection.map((item) => {
        return item.id;
      });
      let params = {
        ids: ids.toString(),
      };
      const res = await this.$api.selectDelete(params);
      this.$message({
        type: "success",
        message: res.data,
      });
      this.Pages.pageIndex = 1;
      this.getTableData();
    },
    // 编辑数据
    async editRowData(row) {
      console.log("编辑数据", row);
      this.rowData = JSON.parse(JSON.stringify(row));
      this.isShowEditDialog = true;
    },
    // 确认编辑数据
    async confirmEdit(editForm) {
      // console.log('确认编辑参数',editForm);
      const res = await this.$api.editData(editForm);
      console.log("编辑接口返回数据", res);
      if (res.msg == "成功") {
        this.$message({
          type: "success",
          message: "编辑成功",
        });
        this.isShowEditDialog = false;
        this.getTableData();
      }
    },
    // 序号翻页递增
    indexMethod(index) {
      let nowPage = this.Pages.pageIndex; //当前第几页，根据组件取值即可
      let nowLimit = this.Pages.pageSize; //当前每页显示几条，根据组件取值即可
      return index + 1 + (nowPage - 1) * nowLimit; // 这里可以理解成一个公式
    },
    // id行作为唯一标识
    getRowKey(row) {
      // console.log("看看每一行的数据", row);
      return row.id;
    },
    // 排序改变
    sortChange(sortInfo) {
      // console.log("排序方式", sortInfo.order);
      // console.log("排序字段", sortInfo.prop);
      this.Pages.pageIndex = 1;
      if (sortInfo.order == "descending") {
        this.Pages.sortOrder = "DESC";
        this.Pages.sortWord = sortInfo.prop;
      } else if (sortInfo.order == "ascending") {
        this.Pages.sortOrder = "ASC";
        this.Pages.sortWord = sortInfo.prop;
      } else {
        this.Pages.sortOrder = "ASC";
        this.Pages.sortWord = "id";
      }
      this.getTableData();
    },
    // 勾选用于导出
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 下载模板文件
    async downloadTemp() {
      const res = await this.$api.downExcelTemp();
      const blob = new Blob([res]); // 把得到的结果用流对象转一下
      var a = document.createElement("a"); //创建一个<a></a>标签
      a.href = URL.createObjectURL(blob); // 将流文件写入a标签的href属性值
      a.download = "模板.xlsx"; //设置文件名
      a.style.display = "none"; // 障眼法藏起来a标签
      document.body.appendChild(a); // 将a标签追加到文档对象中
      a.click(); // 模拟点击了a标签，会触发a标签的href的读取，浏览器就会自动下载了
      a.remove(); // 一次性的，用完就删除a标签
    },
    // 导出表格数据
    async exportExcel() {
      let ids = "";
      this.multipleSelection.forEach((item) => {
        ids = ids + "," + item.id;
      });
      ids = ids.substr(1, ids.length);
      // 勾选的ids--> 30,29,28,27,26,25
      const res = await this.$api.exportExcel({ ids });
      const blob = new Blob([res]); // 把得到的结果用流对象转一下
      var a = document.createElement("a"); //创建一个<a></a>标签
      a.href = URL.createObjectURL(blob); // 将流文件写入a标签的href属性值
      a.download = "导出数据.xlsx"; //设置文件名
      a.style.display = "none"; // 障眼法藏起来a标签
      document.body.appendChild(a); // 将a标签追加到文档对象中
      a.click(); // 模拟点击了a标签，会触发a标签的href的读取，浏览器就会自动下载了
      a.remove(); // 一次性的，用完就删除a标签
    },
    // 上传文件
    beforeExcelUpload(file) {
      // console.log("看一下是什么文件", file);
      const isExcel =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!isExcel) {
        this.$alert(`文件上传失败，原因是：只能上传 .xlsx 格式的表格文件`, "提示", {
          confirmButtonText: "确定",
        });
      }
      return isExcel;
    },
    // 文件上传成功的回调
    upLoadSuccess(res, file) {
      console.log("文件上传成功的返回值", res, file);
      if (res.done == "yes") {
        this.getTableData();
        this.$message({
          type: "success",
          message: res.data,
        });
      } else {
        this.$message.error(res.data);
      }
    },
    // 文件上传失败回调
    upLoadError(err) {
      this.$message.error("当您看到这个错误警告信息的时候，说明您未按照规范上传excel。字段只有姓名、年龄、家乡、备注这四个字段。填写相应的信息即可，请不要在excel中添加一些别的东西哦")
    },
  },
};
</script>

<style lang="less" scoped>
.box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 30px;
  background-color: rgba(240, 230, 230, 0.432);
  .boxTop {
    width: 100%;
    height: 60px;
    line-height: 60px;
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    .addBtn {
      display: flex;
    }
    .inputs {
      .el-input {
        width: 240px;
        margin-right: 12px;
      }
    }
  }
  .boxBottom {
    width: 100%;
    height: calc(100% - 60px);
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 15px 15px 15px;
    .elTableWrap {
      width: 100%;
      height: calc(100% - 40px);
    }
    .elPaginations {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
