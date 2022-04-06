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

    const data = await (await fetch('https://accounts.spotify.com/api/token', {
        body:'grant_type=client_credentials',
        headers:{
            'content-type':'application/x-www-form-urlencoded ',
            'authorization':`Basic ${base64.encode(process.env.SPOTIFY_CLIENT_ID+':'+process.env.SPOTIFY_CLIENT_SECRET)}`
        },
        credentials: 'include',
        method:'POST'
    })).json()
    spotifyApi.setAccessToken(data.access_token)
    const spotifyPlaylist = await spotifyApi.getPlaylist(url.split('/').slice(-1)[0].split('?')[0])
    console.log(spotifyPlaylist)
    if(spotifyPlaylist.statusCode==200){
        const tracks = spotifyPlaylist.body.tracks.items.map(item=>item.track)
        const ret = []
        for(const track of tracks){
            console.log(`${track.artists[0].name} - ${track.name}`)
            try {
                const results = await ytSearch(`${track.artists[0].name} - ${track.name}`,opts)
                if(!results) continue
                const vid = results.results[0]
                ret.push({id:vid.id,title:vid.title})
                console.log(ret)
            } catch (error) {
                console.log("err")
            }
        }
        console.log(ret)
        return res.json(ret)
    }
  
}
