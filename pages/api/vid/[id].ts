// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytdl, { chooseFormat } from 'ytdl-core'

const CHUNK_SIZE_IN_BYTES = 1000000

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const refHostName = req.headers.referer?.split('/')[2]
  // if(refHostName !==  req.headers.host) return res.status(401).send('error: Unauthorized')
 
  const range = req.headers.range as string
  if(!range) return res.status(400).send("Range must be provided")
  const basicInfo = await ytdl.getInfo(req.query.id as string)

  const format = chooseFormat(basicInfo.formats, {quality: "lowestaudio", filter: "audioonly" })
  
  const sizeInBytes = Number(format?.contentLength)

  const chunkStart = Number(range.replace(/\D/g, ""))
  
  const chunkEnd = Math.min(
    chunkStart + CHUNK_SIZE_IN_BYTES,
    sizeInBytes - 1
    )
    
    const contentLength = chunkEnd - chunkStart + 1
    
    const headers = {
    'Content-Range': `bytes ${chunkStart}-${chunkStart}/${sizeInBytes}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-type': 'audio/webm'
  }
  const stream = ytdl(req.query.id as string, {format, range: {start: chunkStart, end: chunkEnd} })
  
  res.writeHead(206, headers)
  
  stream.pipe(res)
  
}
