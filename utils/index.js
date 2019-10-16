const common = {
  verifySqlKeys: (params) => {
    let keyReg = `and|exec|insert|select|delete|update|count|master|truncate|declare|*|%|'|;|-|+|,`;
    return !Object.keys(params).some(v => {
      return keyReg.split('|').some(k => {
        return params[v].indexOf(k) > -1
      })
    })
  }
}
// console.log(verifySqlKeys({prodId: 'f', name: 'deletde'})) 

module.exports = common;