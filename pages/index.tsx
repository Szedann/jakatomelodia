import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '/styles/Home.module.css'

const Game: NextPage = () => {
  const [queue, setQueue] = useState([] as {title:string, id:string}[])
  const [currentSong, setCurrentSong] = useState(null as {title:string, id:string}|null)
  const [URLInput, setURLInput] = useState('')
  const [songsToSet, setSongsToSet] = useState([] as {title:string, id:string}[])
  const [currentIndex, setCurrentIndex] = useState(-2)
  const [guess, setGuess] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  const addToSongs = async (url:string)=>{
    const data = await (await fetch(`/api/details?url=${url}`)).json()
    setSongsToSet([...songsToSet, ...data].filter((item, index, self) => {
      return self.findIndex(i => i.id === item.id) === index
    }))
    setURLInput('')
  }

  const shuffle = (array:any[]) => {
    let currentIndex = array.length, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      [array[currentIndex], array[randomIndex]] =
      [array[randomIndex], array[currentIndex]]
    }

    return array;
  }

  const [lastGuesses, setLastGuesses] = useState([] as {title:string,id:string,correct:boolean, time:number}[])
  const [currentSongStartTimestamp,setCurrentSongStartTimestamp] = useState(0)

  useEffect(()=>{
    setCurrentSong(queue[currentIndex])
    setGuess("")
    setCurrentSongStartTimestamp(new Date().valueOf())
  }, [currentIndex])

  const nextSong = () => {
    if(!isPlaying) return
    setIsPlaying(false)
    if(queue.length < 2) return
    if(currentIndex+1 >= queue.length) setEnded(true)
    else setCurrentIndex(currentIndex + 1)
    if(!currentSong) return
    setLastGuesses([...lastGuesses, {time: (new Date().valueOf()) - currentSongStartTimestamp, title: currentSong?.title, id: currentSong?.id+`${Math.floor(Math.random()*100)}`, correct: currentSong == queue.slice().sort(lSort).find(search)}])
  }
  useEffect(() => {
    setCurrentIndex(currentIndex+1)
  }, [queue])

  const search = (s:{title:string})=>s.title.toLowerCase().includes(guess.toLowerCase());
  const lSort = (a:{title:string},b:{title:string})=>guess.length ? Math.min(1,Math.max(-1,Math.abs(a.title.length-guess.length)-Math.abs(b.title.length-guess.length))) : a.title.localeCompare(b.title)

  const guessesAmount = lastGuesses.length
  const correctGuessesAmount = lastGuesses.filter(g=>g.correct).length
  let totalTime = 0;
  for(const song of lastGuesses){
    totalTime+=song.time
  }

  const removeFromToSet = (id:string) => {
    setSongsToSet(songsToSet.filter(s=>s.id!=id))
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Name that tune</title>
        <meta name="description" content="Name that tune type game" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <main className={styles.main} onKeyUp={e=>{if(e.key=="Enter") nextSong()}}>
        {ended?(
          <>
            <h1>Game Ended!</h1>
            <div>
              correct guesses: {correctGuessesAmount}/{guessesAmount} { guessesAmount && (Math.round(100*correctGuessesAmount/guessesAmount)+"%") },
                total time: {totalTime/1000}s
            </div>
          </>
        ):queue.length < 1 ? (
          <>
            <h2>Add songs</h2>
            <input type="text" placeholder='url' value={URLInput} onChange={e=>setURLInput(e.target.value)}/>
            <input type="button" value="Add" onClick={()=>addToSongs(URLInput)} />
            <input type="button" value="Start" onClick={()=>setQueue(shuffle(songsToSet))} />
            <ul>
              {songsToSet.map(song=><li key={song.id}>{song.title} <span onClick={()=>removeFromToSet(song.id)} style={{color: 'red', cursor: 'pointer'}}>remove</span></li>)}
            </ul>
          </>
        ) : (
          <>
            {currentSong && <audio src={`/api/vid/${currentSong.id}`} onEnded={nextSong} onError={()=>currentIndex>=queue.length?setCurrentIndex(0):setCurrentIndex(currentIndex+1)} onCanPlay={e=>{e.currentTarget.play();setCurrentSongStartTimestamp(new Date().valueOf()); setIsPlaying(true)}}></audio>}
            <h2>Song {currentIndex+1}/{queue.length}</h2>
            <div className={styles.name_input}>
              <input type="text" list='songs' value={guess} onChange={e=>setGuess(e.currentTarget.value)} />
              <ul className={styles.suggestions}>{queue.filter(search).sort(lSort).map(song => <li onClick={e=>{setGuess(e.currentTarget.innerText)}} key={song.id}>{song.title}</li>)}</ul>
            </div>
            
            <input onClick={()=>nextSong()} type="button" value={isPlaying?'Check':'Loading...'} disabled={!isPlaying}/>
            correct guesses: {correctGuessesAmount}/{guessesAmount} { guessesAmount && (Math.round(100*correctGuessesAmount/guessesAmount)+"%") }, 
            total time: {totalTime/1000}s
          </>
        )}
        <div className={styles.last_songs}>
          {lastGuesses.slice(0).reverse().map(guess => <div className={guess.correct?styles.correct_guess:styles.incorrect_guess} key={guess.id}>{guess.correct ? '+' : '-'} {guess.title}({guess.time/1000}s)</div>)}
        </div>
      </main>
    </div>
  )
}

export default Game
