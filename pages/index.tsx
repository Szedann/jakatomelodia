import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [songList, setSongList] = useState([] as {title:string, id:string}[])
  const [currentSong, setCurrentSong] = useState(null as {title:string, id:string}|null)
  const [playlistURLInput, setPlaylistURLInput] = useState('')
  const [playlistURL, setPlaylistURL] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [guess, setGuess] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  useEffect(() => {
    if(!playlistURL) return
    fetch(`/api/playlist/${playlistURL.split('=').slice(-1)[0]}`).then(res => res.json()).then(res => {
      const songs = (res.items.map((item:any)=>({title: item.title, id: item.id})) as {title:string, id:string}[]).filter((item, index, self) => {
        return self.findIndex(i => i.id === item.id) === index
      })
      let currentIndex = songs.length,  randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [songs[currentIndex], songs[randomIndex]] = [
          songs[randomIndex], songs[currentIndex]];
      }
      setSongList(songs)
    })
  }, [playlistURL])
  const [lastGuesses, setLastGuesses] = useState([] as {title:string,id:string,correct:boolean, time:number}[])
  const [currentSongStartTimestamp,setCurrentSongStartTimestamp] = useState(0)

  useEffect(() => {
    setCurrentSong(songList[currentIndex])
    setGuess("")
    setCurrentSongStartTimestamp(new Date().valueOf())
  }, [currentIndex])

  const nextSong = () => {
    if(!isPlaying) return
    setIsPlaying(false)
    if(songList.length < 2) return
    if(currentIndex >= songList.length) {
      setCurrentIndex(0)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
    if(!currentSong) return
    setLastGuesses([...lastGuesses, {time: (new Date().valueOf()) - currentSongStartTimestamp, title: currentSong?.title, id: currentSong?.id, correct: currentSong == songList.find(s=>s.title.toLowerCase().includes(guess.toLowerCase()))}])
  }
  useEffect(() => {
    setCurrentIndex(currentIndex+1)
    console.log('...')
  }, [songList])

  const guessesAmount = lastGuesses.length
  const correctGuessesAmount = lastGuesses.filter(g=>g.correct).length
  let totalTime = 0;
  for(const song of lastGuesses){
    totalTime+=song.time
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Name that tune</title>
        <meta name="description" content="Name that tune type game" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <main className={styles.main}>
        {songList.length < 1 ? (
          <>
            <h2>Enter the playlist</h2>
            <input type="text" placeholder='playlist url' value={playlistURLInput} onChange={e=>setPlaylistURLInput(e.target.value)}/>
            <input type="button" value="save" onClick={()=>setPlaylistURL(playlistURLInput)} />
          </>
        ) : (
          <>
            {currentSong && <audio src={`/api/vid/${currentSong.id}`} onEnded={nextSong} onError={()=>currentIndex >= songList.length?setCurrentIndex(0):setCurrentIndex(currentIndex+1)} onCanPlay={e=>{e.currentTarget.play();setCurrentSongStartTimestamp(new Date().valueOf()); setIsPlaying(true)}}></audio>}
            <h2>What is this song called?</h2>
            <input type="text" list='songs' value={guess} onKeyUp={e=>{if(e.key=="Enter")nextSong()}} onChange={e=>setGuess(e.currentTarget.value)} />
            <datalist id="songs">
              {songList.map(song => <option value={song.title} key={song.id}/>)}
            </datalist>
            <input onClick={nextSong} type="button" value="next"/>
            correct guesses: {correctGuessesAmount}/{guessesAmount} { guessesAmount && (Math.round(100*correctGuessesAmount/guessesAmount)+"%") }, 
            total time: {totalTime/1000}s
          </>
        )}
        <div className={styles.last_songs}>
          {lastGuesses.slice(0).reverse().map(guess => <div key={guess.id}>{guess.correct ? '+' : '-'} {guess.title}({guess.time/1000}s)</div>)}
        </div>
      </main>
    </div>
  )
}

export default Home
