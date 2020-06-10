const { createMatchNamespace } = require('../../socket/wsNamespaces')
var saveNsp;    //GAMBIARRA PRO SERVIDOR SÓ RETORNAR UM NAMESPACE FIXO PARA TESTES //apagar para release
exports.generateMatch = async (req, res, next) => {

if(saveNsp) return res.status(200).json({ status: true, nameSpace: saveNsp })     //apagar para release
  const nameSpace = await createMatchNamespace()
saveNsp = nameSpace                                                               //apagar para release
  if(nameSpace){    
    return res.status(200).json({ status: true, nameSpace: nameSpace })
  }else{
    //tentar recriar?
    return res.status(500).json({ status: false })
  }
}