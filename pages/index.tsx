import { addDoc, collection, doc, getDoc} from 'firebase/firestore'
import { app, db, auth } from '../firebase'
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from  'firebase/auth'
import {useAuthState} from 'react-firebase-hooks/auth'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import styles from '/styles/Home.module.css'
import { FacebookShareButton, TwitterShareButton } from 'react-share'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import {IoTrashBinSharp} from 'react-icons/io5'



const Game: NextPage = () => {
  const [queue, setQueue] = useState([] as {title:string, id:string}[])
  const [title, setTitle] = useState("Name the tune")
  const [currentSong, setCurrentSong] = useState(null as {title:string, id:string}|null)
  const [URLInput, setURLInput] = useState('')
  const [songsToSet, setSongsToSet] = useState([] as {title:string, id:string}[])
  const [currentIndex, setCurrentIndex] = useState(-2)
  const [guess, setGuess] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [playlistID, setPlaylistID] = useState('')
  const [isFirstSet, setIsFirstSet] = useState(false)
  const [volume, setVolume] = useState(.1)
  const router = useRouter()
  const [user] =  useAuthState(auth)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(()=>{
    if(audioRef.current) audioRef.current.volume = volume
  },[volume, audioRef])

  const addToSongs = async (url:string)=>{
    const data = await (await fetch(`/api/details?url=${url}`)).json()
    setSongsToSet([...songsToSet, ...data].filter((item, index, self) => {
      return self.findIndex(i => i.id === item.id) === index
    }))
    setURLInput('')
  }
  useEffect(()=>{
    (async () => {
      const playlistID = router.query.playlistID
      if(typeof playlistID != 'string') return
      const docRef = doc(db, 'playlists', playlistID)
      const docSnap = await (await getDoc(docRef)).data()
      if(!docSnap) return
      setSongsToSet(docSnap.songs)
      if(docSnap.name) setTitle(docSnap.name + " - " + title)
      setPlaylistID(playlistID)
      setIsFirstSet(true)
   })()
  },[router.isReady]);

  useEffect(()=>{
    if(isFirstSet) return setIsFirstSet(false)
    setPlaylistID('')
  },[songsToSet])

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
  const [currentSongTime, setCurrentSongTime] = useState(0)

  useEffect(()=>{
    setCurrentSong(queue[currentIndex])
    setGuess("")
    setCurrentSongStartTimestamp(new Date().valueOf())
  }, [currentIndex])

  useEffect(()=>{
    setInterval(()=>{
      if(audioRef.current) {
        setCurrentSongTime(audioRef.current?.currentTime||0)
      }
    },250)
  },[audioRef])

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
  const copy = (text:string) =>{
    navigator.clipboard.writeText(text)
  }
  const savePlaylist = async ()=>{
    const added = await addDoc(collection(db, 'playlists'),{songs:songsToSet, user: user?.uid, public:false})
    const id = added.id
    setPlaylistID(id)
    copy(`${location.origin}?playlistID=${playlistID}`)
  }

  const shareResults = ()=>{
    const text = `Name the tune game.\ncorrect guesses: ${correctGuessesAmount}/${guessesAmount} ${ guessesAmount && (Math.round(100*correctGuessesAmount/guessesAmount)+"%") }, total time: ${totalTime/1000}s.\nTry to beat me...`
    const data = {text:text,url:`${location.origin}?playlistID=${playlistID}`}
    return data

  }

  const signInWithGoogle = ()=>{
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Music based game made by Szedann" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <Navbar user={user}/>

      <main className={styles.main} onKeyUp={e=>{if(e.key=="Enter") nextSong()}}>
        {ended?(
          <>
            <h1>Game Ended!</h1>
              {user ? (
                <div className={styles.share_menu}>
                  <h3>Share your playlist</h3>
                  {playlistID?(
                  <div className={styles.share_playlist}>
                    click on the link to copy: <br />
                    <code className={styles.button} onClick={e=>copy(e.currentTarget.innerText)}>
                      {location.origin}?playlistID={playlistID}
                    </code>
                  </div>)
                  :
                  (<><span onClick={savePlaylist} className={styles.button}>save the playlist</span> for you & your friends to play</>)}
                  <h3>Or share your results on</h3>
                  {playlistID ? (
                    <div>
                      <FacebookShareButton className={styles.button} quote={shareResults().text} url={shareResults().url} hashtag={"NameTT"}>
                        Facebook,
                      </FacebookShareButton>
                      <TwitterShareButton className={styles.button} title={shareResults().text} url={shareResults().url} hashtags={["NameTT"]}>
                        Twitter,
                      </TwitterShareButton>
                      or&nbsp;
                      <span className={styles.button} onClick={()=>{const sr = shareResults();copy(sr.text+'\n'+sr.url)}}>
                        copy the invite to paste it anywhere
                      </span>
                    </div>
                  ) : <span className={styles.button} onClick={savePlaylist}>on...</span>}
                  <p></p>
                </div>
                
              ):(
                <div className="singIn">
                  <span className={styles.button} onClick={signInWithGoogle}>Sign in with Google</span> to save the playlist or share
                </div>
              )}
              
            
            <div>
              correct guesses: {correctGuessesAmount}/{guessesAmount} { guessesAmount && (Math.round(100*correctGuessesAmount/guessesAmount)+"%") },
              total time: {totalTime/1000}s
            </div>
          </>
        ):queue.length < 1 ? (
          <>
            <h2>Add songs</h2>
            <input type="text" placeholder='youtube video url/playlist url/video title' autoComplete='off' value={URLInput} onChange={e=>setURLInput(e.target.value)}/>
            <input type="button" value="Add" onClick={()=>addToSongs(URLInput)} />
            <input type="button" value="Start" onClick={()=>setQueue(shuffle(songsToSet))} />
            {
            songsToSet.length>0 &&
            (playlistID ? (
               <input type="button" onClick={e=>copy(e.currentTarget.innerText)} value={`copy playlist link: ${location.origin}?playlistID=${playlistID}`} />
            ) : (
              user &&
              <input type="button" value="Save playlist" onClick={()=>savePlaylist()} />
            ))}
            <h3>Added songs:</h3>
            <ol className={styles.to_set}>
              {songsToSet.length ? 
              songsToSet.map(song=><li key={song.id}>{song.title} <span onClick={()=>removeFromToSet(song.id)} className={styles.button+" "+styles.danger}><IoTrashBinSharp size={16} /></span></li>)
              : <em>none</em>
              }
              </ol>
          </>
        ) : (
          <>
            {currentSong && <audio src={`/api/vid/${currentSong.id}`} ref={audioRef} onEnded={nextSong} onError={()=>currentIndex>=queue.length?setCurrentIndex(0):setCurrentIndex(currentIndex+1)} onCanPlay={e=>{e.currentTarget.play();setCurrentSongStartTimestamp(new Date().valueOf()); setIsPlaying(true); if(audioRef.current) audioRef.current.volume = volume;}}></audio>}
            <h2>Song {currentIndex+1}/{queue.length}</h2>
            <div className={styles.name_input}>
              <input autoComplete='off' placeholder='song name' type="text" list='songs' value={guess} onChange={e=>setGuess(e.currentTarget.value)} />
              <ul className={styles.suggestions}>{queue.filter(search).sort(lSort).map(song => <li onClick={e=>{setGuess(e.currentTarget.innerText)}} key={song.id}>{song.title}</li>)}</ul>
            </div>
            <div className={styles.audio_data}>
              <progress value={isPlaying ? currentSongTime : 0} max={isPlaying ? audioRef.current?.duration : 0} />
              <input type="range" value={volume} max={1} min={0} step={0.01} onChange={e=>setVolume(e.currentTarget.valueAsNumber)} />
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
