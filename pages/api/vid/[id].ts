// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytdl, { chooseFormat } from 'ytdl-core'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const refHostName = req.headers.referer?.split('/')[2]
  if(refHostName !==  req.headers.host) return res.status(401).send('error: Unauthorized')
  const stream = ytdl(req.query.id as string, {filter: 'audioonly'})
  stream.on('error', err=>{
    return res.status(300).send(err.message)
  })
  
  stream.pipe(res)
  
}
