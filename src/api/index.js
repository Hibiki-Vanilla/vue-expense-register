import request from "@/utils/http";



// 登录
export const login = (code) => {
  return request(`/u/de/login/${code}`, {
    method: "GET",
  });
};

// 获取钉钉签名
export const jsapi = (data) => {
  return request(`/u/de/dingtalk/getSign`, {
    method: "POST",
    data
  });
};


// 单位维护-获取列表
export const getUnitList = () => {
  return request(`/u/de/unit/list`, {
    method: "GET",
  });
};

// 单位维护-新增单位
export const postUnitDe = (data) => {
  return request(`/u/de/unit/add`, {
    method: "POST",
    data
  });
};

// 单位维护-新增单位
export const putUnitUpdate = (data) => {
  return request(`/u/de/unit/update`, {
    method: "PUT",
    data
  });
};

// 单位维护-删除单位
export const delUnitDel = (id) => {
  return request(`/u/de/unit/del/${id}`, {
    method: "DELETE",
  });
};





// 收支明细-获取列表
export const getDetailsList = (id) => {
  return request(`/u/de/details/list/${id}`, {
    method: "GET",
  });
};
// 收支明细-获取列表
export const getDetailslistAll = () => {
  return request(`/u/de/details/listAll`, {
    method: "GET",
  });
};
// 收支明细-新增明细
export const postDetailsAdd = (data) => {
  return request(`/u/de/details/add`, {
    method: "POST",
    data
  });
};

// 收支明细-修改明细
export const putDetailsUpdate = (data) => {
  return request(`/u/de/details/update`, {
    method: "PUT",
    data
  });
};

// 收支明细-删除明细
export const delDetailsDel = (id) => {
  return request(`/u/de/details/del/${id}`, {
    method: "DELETE",
  });
};


//  明细表-获取搜索列表
export const getConList = (params) =>{
  return request(`/u/de/details/list`, {
    method: "GET",
    params
  });
}

//  明细表-获取树
export const getUnitListSimple = () =>{
  return request(`/u/de/unit/list/simple`, {
    method: "GET",
  });
}
