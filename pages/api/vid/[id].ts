// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytdl, { chooseFormat } from 'ytdl-core'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stream = ytdl(req.query.id as string, {filter: 'audioonly', quality: 'lowest'})
  stream.on('error', err=>{
    return res.status(300).send(err.message)
  })
  
  
  stream.pipe(res)
  
}
