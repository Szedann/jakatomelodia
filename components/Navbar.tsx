import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import Link from "next/link";
import { auth } from "../firebase";
import styles from '/styles/Home.module.css'
import Logo from '../pages/logo.svg'
import { MdExplore } from 'react-icons/md'
import { FaPlay } from 'react-icons/fa'
import { RiPlayListFill } from 'react-icons/ri'
import { IoLogOut, IoLogIn } from 'react-icons/io5'


const Navbar = ({user}:{user:User|null|undefined})=>{
    const signInWithGoogle = ()=>{
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
      }
      console.log(Logo)
    return (<header className={styles.header}>
        <div>
          <Link href='/explore'><span className={styles.button}><MdExplore size={32} /></span></Link>
          <Link href='/'><span className={styles.button}><FaPlay size={26} /></span></Link>
        </div>
        <img src="/logo.png" width={120} className={styles.logo}/>
        {user?(
          <div>
            <Link href='/user-playlists'><span className={styles.button}><RiPlayListFill size={32} /></span></Link>
            <span className={styles.button} onClick={()=>signOut(auth)}><IoLogOut size={32} /></span>
            <img className={styles.profile_picture} src={user.photoURL} alt={user.displayName} />
          </div>
        ):(
          <span className={styles.button} onClick={signInWithGoogle}><IoLogIn size={32} /></span>
          )}
      </header>)
}

export default Navbar