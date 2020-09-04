const { createMatchNamespace, verifyMatchNamespace } = require('../../socket/wsNamespaces')

exports.generateMatch = async (req, res, next) => {

  const nameSpace = await createMatchNamespace()

  if(nameSpace){    
    return res.status(200).json({ status: true, path: process.env.GAME_WS_ROUTE, nameSpace: nameSpace })
  }else{    
    return res.status(500).json({ status: false })
  }
}

exports.verifyMatch = async (req, res, next) => {

  const match = await verifyMatchNamespace(req.params.nameSpace)

  if(match){    
    return res.status(200).json({ status: true })
  }else{
    return res.status(500).json({ status: false })
  }
}