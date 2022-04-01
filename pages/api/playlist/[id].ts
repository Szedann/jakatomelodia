// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytpl from 'ytpl'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if(!ytpl.validateID(req.query.id as string)) return res.json({items:[]})
    ytpl(req.query.id as string).then(res.json)
}
