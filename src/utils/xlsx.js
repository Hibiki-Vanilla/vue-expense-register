import * as XLSX from 'xlsx';
// 设置导出json格式
const setJson = (arr, type) => {
  const excelList = arr.map((item, index) => {
      const fan = [
        {
          日期: item.dateStr,
          部门名: item.unitName,
          摘要: item.abstractInfo,
          期初结余:item.openingBalance,
          收入:item.income,
          支出:item.expenditure,
          登记人:item.userName,
          登记日期:item.createTime
        },
      ];
      return fan;
  });
  const json = excelList.flat(Infinity);
  return json;
};

export const downExcelFile = (name, data, date, header) => {
  // 接收的四个参数： 表名 数订餐数据 日期 类型 头部
  const json = setJson(data);
  // 创建工作表
  const excelData = XLSX.utils.json_to_sheet(json, { header });
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  // 设置列宽
  const colsWidthList = header.map((item, index) => {
    return {
      wpx: index === 2|| index === 7? 200 : 100,
    };
  });

  excelData['!cols'] = colsWidthList; //单元格列宽
  // 将工作表放入工作簿中
  XLSX.utils.book_append_sheet(wb, excelData, `${date}`);
  // 生成文件并下载
  XLSX.writeFile(wb, `${date + '-' + name}.xlsx`);
};
