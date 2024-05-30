import Head from 'next/head';
import { cache, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AgregarLibro() {
    type Viaje = {
        id:string,
        name:string,
        personas:[PersonaViaje]
    }
    type PersonaViaje = {
        username:string,
        idP:string,
        presupuesto:number,
        transacciones:[Transaccion]
    }
    type Transaccion = {
        nombre:string,
        cantidad:number,
        pagan:[{username:string,cantidad:numero}]
    }

    const router = useRouter();
    const { id } = useRouter().query;

    const [mensaje, setMensaje] = useState<string>('');

    const [nombre, setNombre] = useState<string>();
    const [presupuesto, setPresupuesto] = useState<number>();
    const [idP, setId] = useState<string>();

    
    const addViaje = async ( nombre: string | undefined, presupuesto: number | undefined) => {
        try {
            if (!id || !presupuesto) {
                setMensaje('Faltan datos');
                return;
            }
            console.log("kjlnsvhkjlzfvkjlhdvfhkjl")
            console.log(id)
            var raw = JSON.stringify({
                "name": nombre,
                "personas":[
                    {
                        "idP":id,
                        "presupuesto":presupuesto,
                        "transacciones":[]
                    }
                ]
            });
            console.log(raw);
            var requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin":"*"
                },
                body: raw
            };

            const response = await fetch("http://localhost:8080/addViaje", requestOptions)
            console.log("fetch hecho")
            const data = await response.json();

            console.log(data);
            if (data) {
                router.push(`/main/${id}`);
            } else {
                setMensaje(data.mensaje);
            }
        } catch (e) {
            console.log(e);
            setMensaje("Error al crear viaje");
        }
    }
    const handleNavigate = (path: string) => {
        router.push(`/${path}`);
    };
    const joinViaje = async () => {
        try {
            if (!idP) {
                setMensaje('Faltan datos');
                return;
            }

            var raw = JSON.stringify({
                "name": nombre,
                "personas":[
                    {
                        "idP":id,
                        "presupuesto":presupuesto,
                        "transacciones":[]
                        
                    }
                ]
            });
            console.log(raw);
            var requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin":"*"
                },
                body: raw
            };

            const response = await fetch(`http://localhost:8080/joinViaje?v=${idP}&u=${id}`, requestOptions)
            console.log("fetch hecho")
            const data = await response.json();

            console.log(data);
            if (data) {
                router.push(`../main/${id}`);
            } else {
                setMensaje(data.mensaje);
            }
        } catch (e) {
            console.log(e);
            setMensaje("Error al crear viaje");
        }
    }
    return (
        <>
            <Head>
                <title>Agregar viaje</title>
            </Head>

            <div className="topBar">
                <div className="TopBar">
                    <button className="botonTop1" onClick={() => handleNavigate("/")}>LogOut</button>
                    <button className="botonTop2" onClick={() => handleNavigate(`main/${id}`)}>Pagina principal</button>
                </div>
            </div>
            <div className="formContainer">CrearViaje
                <div className="inputGroup">
                    <label className="inputLabel">Nombre:</label>
                    <input
                        type="text"
                        className="selectDropdown"
                        placeholder="Nombre"
                        onChange={(e) => { setNombre(e.target.value) }}
                    />
                </div>

                <div className="inputGroup">
                    <label className="inputLabel">Presupuesto:</label>
                    <input
                        type="number"
                        className="selectDropdown"
                        placeholder="Presupuesto"
                        onChange={(e) => { setPresupuesto(e.target.value) }}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => { addViaje(nombre, presupuesto) }}
                    className="submitButton"
                >
                    Añadir Viaje
                </button>
                <div>Añadir viaje existente</div>
                <div className="inputGroup">
                    <label className="inputLabel">id:</label>
                    <input
                        type="text"
                        className="selectDropdown"
                        placeholder="id"
                        onChange={(e) => { setId(e.target.value) }}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => { joinViaje() }}
                    className="submitButton"
                >
                    Añadir Viaje
                </button>
            </div>
            <div>{mensaje}</div>
        </>
    );
}