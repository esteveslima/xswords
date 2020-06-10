const { createQueueNamespace } = require('../../socket/wsNamespaces')

let lockQueueNsp = undefined;

exports.getQueue = async (req, res, next) => {

  if(lockQueueNsp) return res.status(200).json({ status: true, nameSpace: nameSpace })

  const nameSpace = await createQueueNamespace()

  lockQueueNsp = nameSpace

  if(nameSpace){    
    return res.status(200).json({ status: true, nameSpace: nameSpace })
  }else{
    //tentar novamente?
    return res.status(500).json({ status: false })
  }
}