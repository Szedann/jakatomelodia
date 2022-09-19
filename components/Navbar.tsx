import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import Link from "next/link";
import { auth } from "../firebase";
import styles from '/styles/Home.module.css'


const Navbar = ({user}:{user:User|null|undefined})=>{
    const signInWithGoogle = ()=>{
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
      }
    return (<header className={styles.header}>
        {user?(
          <>
              <span className={styles.user_display_name}>{user.displayName} </span>
              <span className={styles.button} onClick={()=>signOut(auth)}>log out</span>
              <Link href='/user-playlists'><span className={styles.button}>my playlists</span></Link>
            </>
        ):(
          <span>not signed in <span className={styles.button} onClick={signInWithGoogle}>Sign in with Google</span></span>
          )}
          <Link href='/explore'><span className={styles.button}>explore</span></Link>
          <Link href='/'><span className={styles.button}>play</span></Link>
      </header>)
}

export default Navbar