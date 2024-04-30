import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
import router from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const [username, setUsername] = useState<string>("username");
    const [password, setPassword] = useState<string>("password");
    const [mensaje, setMensaje] = useState<string>();
    
    const login = async () => {
        try {
            console.log("login")
            var myHeaders = new Headers();
            console.log("login2")
            myHeaders.append("Content-Type", "application/json");
            console.log("login3")
            var requestOptions = {
                method: 'GET',
                headers: myHeaders
            };
            console.log("login4")
            const url = `http://localhost:8080/login?user=${username}&pw=${password}`;
            console.log(url)
            console.log("fetcheando")
            try{
              const response = await fetch(url, requestOptions)
            }catch (e){
              console.log(e)
            }
            
            console.log("fetch hecho")
            const data = await response.json();
            console.log(data);
            if (response.ok) {

                const idObjeto = data._id;

                router.push(`/main/${idObjeto}`);
            } else {
                setMensaje(data.msg);
            }
        } catch (e) {
            setMensaje('Error al iniciar sesion');
        }
    }
    const signIn = async () => {
        try {
            console.log("signin")
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");


            var raw = JSON.stringify({
                "username": username,
                "password":password
            });
            console.log(raw);
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
            };

            const response= await fetch("http://localhost:8080/addUser", requestOptions)
            console.log("fetch hecho")
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                
                const idObjeto = data.idObjeto;

                router.push(`/main/${idObjeto}`);
            } else {
                setMensaje(data.mensaje);
            }
        } catch (e) {
            setMensaje('Error al crear cuenta');
        }
    }

    return (
        <div className="LoginBody">
            <div className="LoginScreen">
                <div className="LoginForm">
                    <h1 className="LoginTitle">Login/SignIn</h1>
                    <input className="LoginUserName" type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)}></input>
                    <input className="LoginPassword" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input>
                    <div className="aviso">aviso, esta pagina es una prueba, las contrasenas se guardan en texto plano</div>
                    <div className="botones">
                        <button className="SignInButton" onClick={() => {signIn()}}>SignIn</button>
                        <button className="LogInButton" onClick={() => {login() }}>Login</button>
                    </div>
                    <div className="LoginMensaje">{mensaje}</div>
                </div>
            </div>
        </div>
    
    )
}