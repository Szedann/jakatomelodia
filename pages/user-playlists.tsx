import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where} from 'firebase/firestore'
import { app, db, auth } from '../firebase'
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from  'firebase/auth'
import {useAuthState} from 'react-firebase-hooks/auth'
import type { NextComponentType, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FunctionComponent, ReactComponentElement, ReactElement, useEffect, useState } from 'react'
import styles from '/styles/Home.module.css'
import { FacebookShareButton, TwitterShareButton } from 'react-share'
import Link from 'next/link'
import Navbar from '../components/Navbar'


interface song{
    title:string;
    id:string;
}
interface playlist{
    name:string|undefined;
    id:string;
    public?:boolean;
    songs: song[]
}

const Playlist = ({playlist, changePlaylistName, deletePlaylist, setPublic}:{playlist:playlist,changePlaylistName:(id:string,name:string)=>void, deletePlaylist:(id:string)=>void, setPublic:(id:string,value:boolean)=>void})=>{
    const [extended, setExtended] = useState(false)
    const [isPublic, setIsPublic] = useState(playlist.public)
    return (
        <li key={playlist.id} className={styles.playlist_field} >
            <div className={styles.general}>
                <input type="text" value={playlist.name||''} placeholder="unnamed" onChange={e=>changePlaylistName(playlist.id, e.currentTarget.value)} />
                <span className={styles.song_amount}>{playlist.songs.length} songs</span>
                <label className={styles.is_public}>
                    <span>{isPublic?'public':'private'}</span>
                    <input type="checkbox" checked={isPublic}
                     onChange={e=>{setPublic(playlist.id, e.currentTarget.checked); setIsPublic(e.currentTarget.checked)}}
                      />
                </label>
                <Link href={`${location.origin}?playlistID=${playlist.id}`}><span className={styles.button}>play</span></Link>
                <span className={styles.button+" "+styles.danger} onClick={()=>deletePlaylist(playlist.id)}>delete</span>
                <div onClick={()=>setExtended(!extended)} style={{cursor:"pointer", width:'fit-content'}}>{extended?"▲":"▼"}</div>
            </div>

            <div className={styles.extended}>
                {extended && (
                    <ol>
                        {playlist.songs.map(song=><li key={song.id}>{song.title}</li>)}
                    </ol>
                )}
            </div>
        </li>
    )
}

const Playlists: NextPage = () => {
    const [user] = useAuthState(auth)
    const [playlists, setPlaylists] = useState([] as playlist[])

    const signInWithGoogle = ()=>{
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
    }

    useEffect(()=>{
        if(!user) return
       (async () => {
        const docs = await getDocs(query(collection(db,'playlists'), where('user','==',user?.uid)));
        const newPlaylists:playlist[] = []
        docs.forEach(doc=>{
            const data = doc.data()
            newPlaylists.push({id:doc.id, name: data.name, songs: data.songs, public:data.public})
        })
        setPlaylists(newPlaylists)

       })()
    },[user])

    const changePlaylistName = (id:string, name:string)=>{
        const playlist = playlists.find(playlist=>playlist.id==id)
        if(!playlist) return
        const newPlaylist = {...playlist, name}
        setDoc(doc(db, 'playlists',id),{...newPlaylist, user:user?.uid})
        setPlaylists([...playlists.filter(playlist=>playlist.id!==id),newPlaylist])
    }

    const deletePlaylist = (id:string)=>{
        deleteDoc(doc(db, 'playlists', id))
        setPlaylists(playlists.filter(playlist=>playlist.id!==id))
    }

    const setPublic = (id:string, value:boolean)=>{
        updateDoc(doc(db, 'playlists', id),{
            public: value
        })
    }
  
    return (
        <div className={styles.container}>
        <Head>
            <title>My playlists</title>
            <meta name="description" content="Music based game made by Szedann" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <Navbar user={user}/>


        <main className={styles.main}>
            <h1>My playlists</h1>
            <ul className={styles.playlist_list}>
                {user?(
                    playlists.length
                    ? playlists.map(playlist=><Playlist changePlaylistName={changePlaylistName} setPublic={setPublic} deletePlaylist={deletePlaylist} playlist={playlist} key={playlist.id}/>)
                    : <em>you don&apos;t have any saved playlists</em>
                ):(
                    <li><em>you are not signed in</em></li>
                )}
            </ul>
        </main>
        </div>
    )
}

export default Playlists
