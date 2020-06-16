const { createQueueNamespace } = require('../../socket/wsNamespaces')

let lockQueueNsp = undefined;

exports.getQueue = async (req, res, next) => {

  //trava apenas uma queue, mas foi deixado no modelo do ws do jogo para que possibilite novos queues em outras namespaces
  if(lockQueueNsp) return res.status(200).json({ status: true, nameSpace: lockQueueNsp })

  const nameSpace = await createQueueNamespace()

  lockQueueNsp = nameSpace

  if(nameSpace){    
    return res.status(200).json({ status: true, nameSpace: nameSpace })
  }else{
    //tentar novamente?
    return res.status(500).json({ status: false })
  }
}