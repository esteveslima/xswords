const { createMatchNamespace } = require('../../socket/wsNamespaces')
var saveNsp;    //GAMBIARRA PRO SERVIDOR SÓ RETORNAR O PRIMEIRO NAMESPACE CRIADO 
               //E SIMULAR OS JOGADORES ENTRANDO NA MESMA PARTIDA
exports.generateMatch = async (req, res, next) => {
if(saveNsp){
  const endPoint = `http://127.0.0.1:7000/${saveNsp}`   
  return res.status(200).json({ status: true, endPoint: endPoint })
}

  const nameSpace = await createMatchNamespace()
saveNsp = nameSpace
  if(nameSpace){
    const endPoint = `http://127.0.0.1:7000/${nameSpace}`
    return res.status(200).json({ status: true, endPoint: endPoint })
  }else{
    //tentar recriar?
    return res.status(500).json({ status: false })
  }
}