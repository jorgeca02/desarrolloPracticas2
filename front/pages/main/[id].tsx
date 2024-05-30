import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import router, { useRouter } from 'next/router'
import { type } from 'os'
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

export default function Main() {
    const router = useRouter()
    const query:{id: string} = router.query;
    type viaje = {
        _id:string,
        nombre:string
    }
    const [viajes, setViajes] = useState<viaje[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    
    useEffect(() => {
        // Cuando el componente se monta, obtenemos el id de la ruta actual y lo actualizamos en el estado
        
        
        fetchTodo()
    }, [query.id]);

    const fetchTodo = async () => {

        setLoading(true);
        console.log("hey")
        await fetchViajes()
        setLoading(false);
    }

    const handleNavigate = (path: string) => {
        router.push(`/${path}`);
    };

    const fetchViajes = async () => {
        try {
            console.log("fetch")
            const url = `http://localhost:8080/getViajePersona?persona=${query.id}`;
            console.log(url)
            console.log("url")
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin":"*"
                },
            });
            console.log(response)
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data:viaje[] = await response.json();
            console.log("data")
            setViajes(data)
        } catch (error) {
            console.error('Error fetching viajes:', error);
        }
    };

    return (
        <div className="MainBody">
            <div className="TopBar">
                <button className="botonTop1" onClick={() => handleNavigate()}>LogOut</button>
                <button className="botonTop2" onClick={() => handleNavigate(`CrearViaje/${query.id}`)}>Crear Viaje</button>
            </div>
            <div>
                {loading ? <div className="loading">Cargando ...</div> : viajes.map(v => (
                    <Link key={v._id} href={`../viaje?v=${v._id}&u=${query.id}`}><div className="viaje">{v.name}</div></Link>
                ))}
            </div>
        </div>
    )
}