// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import ytdl from 'ytdl-core'
import ytpl from 'ytpl'
import SpotifyWebApi from 'spotify-web-api-node'
import ytSearch, { YouTubeSearchOptions } from 'youtube-search'
import base64 from 'base-64'

const spotifyApi = new SpotifyWebApi()

const opts:YouTubeSearchOptions={
    key:process.env.YOUTUBE_API_KEY,
    maxResults:5
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{title:string,id:string}[]>
) {
    const url = req.query.url as string
    if(!url) return res.json([])
    if(ytdl.validateURL(url)){
        const details = (await ytdl.getBasicInfo(url)).videoDetails
        return res.json([{
            title: details.title,
            id: details.videoId
        }])
    }
    if(ytpl.validateID(url)){
        const videos = (await ytpl(url, {limit:Infinity})).items
        return res.json(videos.map(vid=>{return {title:vid.title,id:vid.id}}))
    }

    const searchResults = await ytSearch(url,opts)

    const title = searchResults.results[0].title
    const id = searchResults.results[0].id

    return res.json([{title,id}])
}
