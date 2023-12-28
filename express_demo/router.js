const express = require('express')
const route = express.Router() // 实例化一个路由对象

// 引入文件读取模块
const fs = require('fs')

// 引入node-xlsx包
const xlsx = require('node-xlsx')

// 引入multiparty包用于读取上传的文件
var multiparty = require('multiparty');

// 引入连接池
const pool = require('./sql/index')

// 引入工具包
const util = require('./util/index')

// 分页排序接口（带有模糊搜索查询）
route.get('/getTableData', (req, res) => {

  console.log('请求参数', req.query);
  /* 一般的分页参数一共有四个:排序字段、排序方式、第几页、每页几条 */
  // 分页查询格式： select * from table limit (start-1)*limit,limit;
  // let sql = "select * from people_table ORDER BY age ASC LIMIT 0,2"
  // let sql = "select * from people_table"
  // 又因为这个接口带有模糊查询，所以使用like模糊查询searchWord

  let sql = null // 拼接sql语句
  if (req.query.sortWord == "age" | req.query.sortWord == "id") {                                                                                                                                         // 数字类型的使用默认排序 比如年龄和id
    sql = `select * from people_table WHERE (name LIKE '%${req.query.searchWord}%' OR home LIKE '%${req.query.searchWord}%' OR remark LIKE '%${req.query.searchWord}%') AND is_delete_status <> 0 ORDER BY ${req.query.sortWord} ${req.query.sortOrder} LIMIT ${(req.query.pageIndex - 1) * (req.query.pageSize)},${req.query.pageSize}`
  } else {                                                                                                                                                                                                    // 汉字类型的，强制使用GBK排序，这样的话，就能够按照汉语拼音排序了
    sql = `select * from people_table WHERE (name LIKE '%${req.query.searchWord}%' OR home LIKE '%${req.query.searchWord}%' OR remark LIKE '%${req.query.searchWord}%') AND is_delete_status <> 0 ORDER BY CONVERT( ${req.query.sortWord} USING gbk ) ${req.query.sortOrder} LIMIT ${(req.query.pageIndex - 1) * (req.query.pageSize)},${req.query.pageSize}`
  }

  // console.log('拼接好的sql语句',sql);

  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      connection.release()
      let apiRes = {
        code: 0,
        msg: "成功",
        data: results
      }
      res.send(apiRes)
    })
  })
})

// 查询总条目数接口
route.get("/getTotalCount", (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(`select count(*) AS total from people_table WHERE (name LIKE '%${req.query.searchWord}%' OR home LIKE '%${req.query.searchWord}%' OR remark LIKE '%${req.query.searchWord}%') AND is_delete_status <> 0`, function (error, results, fields) {
      connection.release()
      let apiRes = {
        code: 0,
        msg: "成功",
        data: results[0].total
      }
      res.send(apiRes)
    })
  })
})

// 删除某一条数据的接口 常用做法，逻辑删除；另有不常用做法：真删除（物理删除），下一个接口即是
route.get("/deleteData", (req, res) => {
  let sql = `UPDATE people_table SET is_delete_status = 0 WHERE id = ${req.query.id}`
  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      connection.release()
      if (results.affectedRows == 1) { // 说明影响了一行，即 将逻辑删除字段修改了，删掉了一行
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "恭喜您，删除成功啦..."
        }
        res.send(apiRes)
      } else {
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "很抱歉，删除失败了..."
        }
        res.send(apiRes)
      }
    })
  })
})

//  删除某一条数据接口 不太好做法，真删除（物理删除），一般不会这样写
route.get("/trueDeleteData", (req, res) => {
  let sql = `DELETE from people_table WHERE id = ${req.query.id}`
  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      connection.release()
      if (results.affectedRows == 1) { // 说明影响了一行，即 真删掉了一行
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "恭喜您，删除成功啦..."
        }
        res.send(apiRes)
      } else {
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "很抱歉，删除失败了..."
        }
        res.send(apiRes)
      }
    })
  })
})

// 勾选批量删除接口
route.get("/selectDelete", (req, res) => {
  console.log(req.query.ids);
  let sql = `UPDATE people_table SET is_delete_status = 0 WHERE id in (${req.query.ids})`
  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      console.log('结果', results);
      connection.release()
      if (results.affectedRows != 0) { // 说明影响了一行，即 将逻辑删除字段修改了，删掉了一行
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "恭喜您，批量删除成功啦..."
        }
        res.send(apiRes)
      } else {
        let apiRes = {
          code: 0,
          msg: "失败",
          data: "很抱歉，批量删除失败了..."
        }
        res.send(apiRes)
      }
    })
  })
})


/**
 * 值得一提的是，我这里没有做封装sql语句函数
 * 所以一些sql语句是动态拼接上去的
 * 实际工作中还是要根据项目需求封装一下sql语句的
 * 主要是方便能一步步的看懂
 * */

// 新增数据接口
route.post("/addData", (req, res) => {

  // console.log('新增接口请求参数',req.body);
  // console.log('新增接口请求参数',Object.keys(req.body));
  // console.log('新增接口请求参数',Object.values(req.body));
  // 正确sql语句： INSERT INTO myTale(NAME,sex,borndate) VALUES('白骨精','女','2021-05-16');
  // 错误sql语句： INSERT INTO myTale(NAME,sex,borndate) VALUES(白骨精,女,2021-05-16);
  // 因为往数据库中写入数据需要注意引号的问题，即VALUES()中需要带上引号，所以下方的拼接sql语句要使用转义字符 \' 

  let str = ""  // 这里大家可以打断点、或者打印看看就晓得了
  Object.values(req.body).forEach((item) => {
    str = str + "\'" + item + "\'" + ","
  })
  // console.log('截取一下',str.substr(0,str.length -1)); // 截取一下，不要最后的一个逗号
  let editStr = str.substr(0, str.length - 1)

  let sql = `INSERT INTO people_table (${Object.keys(req.body).toString()}) VALUES(${editStr})`
  // console.log("看看使用转义字符拼接好的sql语句", sql);

  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      connection.release()
      if (results.affectedRows == 1) {
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "恭喜您，新增成功啦..."
        }
        res.send(apiRes)
      } else {
        let apiRes = {
          code: 0,
          msg: "失败",
          data: "抱歉新增失败"
        }
        res.send(apiRes)
      }
    })
  })
})

// 编辑数据接口
route.post("/editData", (req, res) => {

  // 将参数加工一下
  let id = req.body.id
  delete req.body.id
  // console.log('原始参数', req.body);
  // console.log('keys数组参数', Object.keys(req.body));
  // console.log('values数组参数', Object.values(req.body));

  let keysArr = Object.keys(req.body)
  let valuesArr = Object.values(req.body)

  let str = ""
  for (let i = 0; i < keysArr.length; i++) {
    for (let j = 0; j < valuesArr.length; j++) {
      if (i == j) {
        str = `${str},${keysArr[i]}=${"\'" + valuesArr[i] + "\'"}`
      }
    }
  }
  str = str.substr(1, str.length)

  let sql = `UPDATE people_table SET ${str} WHERE id=${id}`
  // console.log("看看拼接好的sql语句-->",sql);

  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      connection.release()
      console.log('编辑数据库结果--->', results);
      if (results.affectedRows == 1) {
        let apiRes = {
          code: 0,
          msg: "成功",
          data: "恭喜您，编辑成功啦..."
        }
        res.send(apiRes)
      } else {
        let apiRes = {
          code: 0,
          msg: "失败",
          data: "抱歉编辑失败了！"
        }
        res.send(apiRes)
      }
    })
  })
})

// excel下载模板接口
route.get("/downExcelTemp", (req, res) => {
  const dataByParse = xlsx.parse(fs.readFileSync('./excelTemplate/模板excel.xlsx'));
  res.send(xlsx.build(dataByParse))
})

// excel导出接口
route.post('/exportExcel', (req, res) => {
  let sql = `SELECT name,home,age,remark FROM people_table WHERE FIND_IN_SET(id,'${req.body.ids}')`
  // console.log('拼接好的sql语句-->', sql);
  pool.getConnection(function (err, connection) {
    if (err) { throw err }
    connection.query(sql, function (error, results, fields) {
      connection.release()
      // console.log('编辑数据库结果--->', results);

      let data = []
      // data.push(Object.keys(results[0])) // excel表格表头（英文的）
      data.push(["姓名", "年龄", "家乡", "备注"]) // excel表格表头（中文的）

      results.forEach((item) => {
        data.push(Object.values(item))
      })
      // console.log('加工的data数据',data);

      let sheetArr = [ // excel表格内容数据
        {
          name: "sheet123", // 指定sheet的名字
          data: data // 对应sheet的内容
        },
      ]

      let optionArr = { // excel表格内容配置数据
        "!cols": [
          { wch: 15 },
          { wch: 15 },
          { wch: 10 },
          { wch: 30 },
        ],
      }
      // build方法用来生成一个表格，并以二进制文件的形式传递给前端
      // 这里要用end方法，如果使用send方法就会报错
      res.end(xlsx.build(sheetArr, optionArr))
    })
  })
})

// 上传excel接口
route.post('/uploadExcel', function (req, res) {
  // 第一步，使用multiparty中间件的Form()方法将前端传递过来的表格文件转化为实例对象
  var form = new multiparty.Form();
  // 第二步，将这个实例对象parse解析一下，就能得到这个excel文件信息
  form.parse(req, function (err, fields, file) {
    // console.log("临时文件路径", (file.file)[0].path);// 可以获取到临时文件的临时路径，存放在C盘中的\AppData\Local\Temp
    let tempPath = (file.file)[0].path
    // 第三步，根据文件临时路径读取文件，并使用node-xlsx插件包解析读取到的文件
    const dataByParse = xlsx.parse(fs.readFileSync(`${tempPath}`));
    // console.log('解析读取到的文件', dataByParse[0].data); // 解析的格式就是node-xlsx这种格式的
    let dataArr = dataByParse[0].data // 二维数组，第一项是表头数据，后面的都是表体数据
    // 第四步，二维数组遍历校验数据
    let alertStr = ""
    // i=0是第一项，第一项表头数据不用，所以索引从1开始
    for (let i = 1; i < dataArr.length; i++) {
      // console.log("每一项数据", dataArr[i]);
      for (let j = 0; j < dataArr[i].length; j++) {
        // console.log('最内层数据', dataArr[i][j]);
        /*假设我们有这样的一个简单校验需求，如果填写年龄了，就必须为number数字类型的，不能填写文字符号类型的；没填写就是undefined类型的；*/
        if (typeof dataArr[i][1] == 'undefined') { // 没填写就是undefined
          // 说明没有问题的，格式正确的
        } else if ((typeof dataArr[i][1] == 'number')) { // 填写了数字以后，需要继续校验，得是大于零的整数
          let checkNum = dataArr[i][1]
          let reg = /^[1-9]\d*$/ // 正整数的正则
          if (reg.test(checkNum)) {
            // console.log("符合要求就是正整数");
          } else {
            // console.log("不符合要求，不是正整数");
            alertStr = alertStr + "  " + dataArr[i]
            break
          }
        } else {
          // 说明有问题
          alertStr = alertStr + "  " + dataArr[i]
          break
        }
      }
    }
    // 第五步，根据校验结果返回给前端相应的数据
    if (alertStr == "") {
      // 若经过上面一波循环操作后，alertStr不变，还是空子字符串，就说明没有错误的单元格，反之有
      // 说明没有错误的单元格填写，正确的话，就可以写入sql语句了

      // console.log('dataArr',dataArr);

      // 第六步，给单元格做数据填充，填充的原因是，若一行数据最后一个单元格没写，node-xlsx无法读取，单元格就少一条了
      for (let i = 1; i < dataArr.length; i++) {
        if (dataArr[i].length < 4) {
          dataArr[i].length = 4
        }
        for (let j = 0; j < dataArr[i].length; j++) {
          if (typeof dataArr[i][j] == "undefined") {
            dataArr[i][j] = null // 然后用null填充进去
          }
          // console.log("-->",dataArr[i][j]);
        }

        // console.log('--->', dataArr[i] )
        // console.log('--->', util.editSqlWords(dataArr[i]) )
      }
      // console.log('填充以后的excel数据',dataArr);

      // 拼接sql语句，标准格式为：INSERT INTO people_table (name,age,home,remark) VALUES ('张三',18,'北京','小张') , ('李四',20,'上海','小李')
      let sql = "INSERT INTO people_table (name,age,home,remark) VALUES "
      dataArr.forEach((item, index) => {
        if (index > 0) { // 第一行数据是 '姓名','年龄','家乡','备注' 不用做加工
          sql = sql + "" + util.editSqlWords(item) + ","
        }
      })
      sql = sql.substring(0, sql.length - 1)
      console.log('拼接好的sql', sql);

      pool.getConnection(function (err, connection) {
        if (err) { throw err }
        connection.query(sql, function (error, results, fields) {
          connection.release()
          if (results.affectedRows >= 1) {
            let apiRes = {
              code: 0,
              done: "yes",
              data: "恭喜您，批量上传数据成功啦..."
            }
            res.send(apiRes)
          } else {
            let apiRes = {
              code: 0,
              done: "no",
              data: "很抱歉，批量上传数据失败"
            }
            res.send(apiRes)
          }
        })
      })



    } else {
      // 说明有错误的单元格填写
      res.send({
        done: "no",
        msg: "未按照正确格式填写excel，问题行数据是:" + alertStr
      })
    }



    // 最后再使用fs模块根据文件路径去移除这个临时文件，这样的话，就不会造成文件冗余了
  });
});

module.exports = route // 暴露出去方便管理