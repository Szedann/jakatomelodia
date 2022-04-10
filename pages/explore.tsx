import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, query, setDoc, updateDoc, where} from 'firebase/firestore'
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

const Playlist = ({playlist}:{playlist:playlist})=>{
    const [extended, setExtended] = useState(false)
    return (
        <li key={playlist.id} className={styles.playlist_field} >
            <div className={styles.general}>
                <input type="text" value={playlist.name||''} readOnly={true} placeholder="unnamed"/>
                <span className={styles.song_amount}>{playlist.songs.length} songs</span>
                <Link href={`${location.origin}?playlistID=${playlist.id}`}><span className={styles.button}>play</span></Link>
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

const Explore: NextPage = () => {
    const [user] = useAuthState(auth)
    const [playlists, setPlaylists] = useState([] as playlist[])
    const [searchInput, setSearchInput] = useState('')

    const search = ()=>{
        const searchTerm = searchInput.toLowerCase();
        const strlength = searchTerm.length;
        const strFrontCode = searchTerm.slice(0, strlength-1);
        const strEndCode = searchTerm.slice(strlength-1, searchTerm.length);
        const endCode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);

        setSearchInput('');

        console.log(searchTerm);
        (async () => {
        const docs = await getDocs(query(collection(db,'playlists'),
        where('public', '==', true)
        // , where('name', '>=', searchTerm), where('name', '<', endCode), limit(10)
        ));
        const newPlaylists:playlist[] = []
        docs.forEach(doc=>{
            const data = doc.data()
            newPlaylists.push({id:doc.id, name: data.name, songs: data.songs})
        })
        console.log(newPlaylists)
        setPlaylists(newPlaylists)

       })()
    }
    useEffect(()=>{
        search()
    },[])
  
    return (
        <div className={styles.container}>
        <Head>
            <title>Explore playlists by other users</title>
            <meta name="description" content="Music based game made by Szedann" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <Navbar user={user}/>


        <main className={styles.main}>
            <h1>Public playlists</h1>
            {/* <input type="text" placeholder='name' autoComplete='playlist_name' value={searchInput} onChange={e=>setSearchInput(e.currentTarget.value)} onKeyUp={e=>{if(e.key == 'Enter') search()}}/> */}
            <ul className={styles.playlist_list}>
                {playlists.length
                ? playlists.map(playlist=><Playlist playlist={playlist} key={playlist.id}/>)
                : <em>Couldn&apos;t find any playlists</em>}

            </ul>
        </main>
        </div>
    )
}

export default Explore
