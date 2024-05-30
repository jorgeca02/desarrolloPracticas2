import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

export default function Viaje() {
    const router = useRouter();
    const { v, u } = router.query;

    type Viaje = {
        _id: string,
        name: string,
        personas: PersonaViaje[]
    }
    type PersonaViaje = {
        username: string,
        idP: string,
        saldo: number,
        gasto: number,
        presupuesto: number,
        transacciones: Transaccion[],
        pendientes: Pago[]
    }
    type Transaccion = {
        nombre: string,
        cantidad: number,
        pagan: { username: string, cantidad: number }[]
    }
    type Pago = {
        idP: string,
        cantidad: number
    }
    const [viaje, setViaje] = useState<Viaje>()
    const [persona, setPersona] = useState<PersonaViaje>()
    const [loading, setLoading] = useState<boolean>(true)
    const [presupuesto, setPresupuesto] = useState<number>()
    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario
    const [personaPagan, setPersonaPagan] = useState<{ username: string, cantidad: string }[]>([{ username: '', cantidad: '' }]);
    const [transMsg, setTransMsg] = useState<string>();

    const agregarPersona = () => {
        setPersonaPagan([...personaPagan, { username: '', cantidad: '' }]);
    };
    useEffect(() => {
        fetchTodo()
    }, [v, u]);
    useEffect(() => {
        if (viaje)
            viaje.personas.forEach(element => {
                if (element.idP == u)
                    setPersona(element)
            });
    }, [viaje]);
    useEffect(() => {
        if (persona)
            setPresupuesto(persona.presupuesto);
    }, [persona]);
    useEffect(() => {
        if (viaje && persona && presupuesto!=null)
            setLoading(false)
        else
            setLoading(true)
    }, [viaje, persona, presupuesto]);
    useEffect(() => {
        console.log("viaje:")
        console.log(viaje)
        console.log("persona:")
        console.log(persona)
        console.log("presupuesto:")
        console.log(presupuesto)
    }, [viaje, persona, presupuesto]);
    const fetchTodo = async () => {
        fetchViaje()
    }
    const fetchViaje = async () => {
        try {
            const url = `http://localhost:8080/getViaje?id=${v}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*"
                },
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            const data: Viaje = await response.json();
            setViaje(data)
        } catch (error) {
            console.log('Error fetching viajes:', error);
        }
    };
    const handleNavigate = (path: string) => {
        router.push(`/${path}`);
    };
    const GuardarCambios = async () => {

        var requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            }
        };
        const url = `http://localhost:8080/updateBudget?user=${u}&viaje=${v}&budget=${presupuesto}`;
        const response = await fetch(url, requestOptions)
        const data = await response.json();
        console.log(data);
        if (data) {
            fetchViaje()
            return
        } else {
            setMensaje(data.mensaje);
        }
    };
    const handleCreateTransaction = () => {
        setShowForm(true);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        // Convertir los datos del formulario a un objeto
        const formDataObject: any = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });
        console.log(formDataObject)
        console.log(formData)
        // Construir el objeto de la transacción
        const nuevaTransaccion: Transaccion = {
            nombre: formDataObject.nombre as string,
            cantidad: parseInt(formDataObject.cantidad as string),
            pagan: personaPagan.map((pago) => ({
                username: formDataObject[`usernamePersona${personaPagan.indexOf(pago)}`] as string, // Acceder correctamente al valor del nombre de usuario
                cantidad: parseInt(pago.cantidad)
            }))
        };

        // Imprimir el objeto de la transacción
        console.log('Transacción creada:', nuevaTransaccion);
        const url = `http://localhost:8080/addTransaccion?u=${u}&v=${v}`;
        var raw = JSON.stringify(nuevaTransaccion);
        console.log(raw);
        var requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            },
            body: raw
        };
        const response = await fetch(url, requestOptions)

        if (!response.ok) {
            console.log(response);
        }
        fetchViaje();
        // Limpiar el formulario y reiniciar el estado de los mensajes
        setShowForm(false);
        setTransMsg("");
        setPersonaPagan([{ username: '', cantidad: '' }]);
    };

    const handleCantidadChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = event.target;
        const newPersonaPagan = [...personaPagan];
        newPersonaPagan[index] = { ...newPersonaPagan[index], cantidad: value };
        setPersonaPagan(newPersonaPagan);
    };

    const handleSelectChange = (event, index) => {
        const { name, value } = event.target;
        const newPersonaPagan = [...personaPagan];
        newPersonaPagan[index] = { ...newPersonaPagan[index], [name]: value };
        setPersonaPagan(newPersonaPagan);
    };

    const eliminarPersona = (index) => {
        const newPersonaPagan = [...personaPagan];
        newPersonaPagan.splice(index, 1);
        setPersonaPagan(newPersonaPagan);
    };
    const pagar = async (id,cantidad) => {
        event.preventDefault();
        const nuevoPago: Transaccion = {
            idP: id,
            cantidad:cantidad
        };

        
        const url = `http://localhost:8080/addPago?u=${u}&v=${v}`;
        var raw = JSON.stringify(nuevoPago);
        console.log(raw);
        var requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*"
            },
            body: raw
        };
        const response = await fetch(url, requestOptions)

        if (!response.ok) {
            console.log(response);
        }
        fetchViaje();
    };

    return (
        <div className="ViajeMainBody">
            <div className="TopBar">
                <button className="botonTop1" onClick={() => handleNavigate("/")}>LogOut</button>
                <button className="botonTop2" onClick={() => handleNavigate(`/main/${u}`)}>Pagina Principal</button>
            </div>
            <div className="ViajeContent">
                {loading ? <div className="ViajeLoading">Cargando ...</div> :
                    <div className="ViajeContent2">
                        <div className="ViajeViajeName">{viaje.name}</div>
                        <div className="ViajeViajeId">id:{viaje._id}</div>
                        <div className="ViajeInfo">
                            <div className="ViajeCuentasIndividuales">
                                <div className="ViajePresupuesto">
                                    <div className="ViajeInfo">
                                        {"presupuesto: "}
                                        <input
                                            className="ViajePresupuestoInput"
                                            type="number"
                                            name="presupuesto"
                                            value={presupuesto}
                                            onChange={e => setPresupuesto(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="ViajeInfo">
                                        {"gasto: " + persona.gasto}
                                    </div>
                                    <div className="ViajeInfo">
                                        {"restante: " + (persona.presupuesto - persona.gasto)}
                                    </div>
                                    <button type="button" className="ChangeBudgetButton" onClick={GuardarCambios}>Guardar cambios</button>
                                </div>
                                <div className="ViajeTransacciones">Transacciones
                                    {persona.transacciones.map((transaccion, index) => (
                                        <div key={index} className="ViajeTransaccion">
                                            <div className="ViajeNombre">{transaccion.nombre}</div>
                                            <div className="ViajeCantidad">{transaccion.cantidad}</div>
                                            <div>
                                                {transaccion.pagan.length > 0 &&
                                                    <div className="ViajePagadores">
                                                        {transaccion.pagan.map((pagador, index) => (
                                                            <div key={index} className="ViajePagador">
                                                                <div>{pagador.username} paga {pagador.cantidad}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="CreateTransactionButton" onClick={handleCreateTransaction}>
                                    Crear Transacción
                                </button>

                                {showForm && (
                                    <div className="TransactionFormPopup">
                                        <h2>Crear Nueva Transacción</h2>
                                        <form onSubmit={handleSubmit}>
                                            <div>
                                                <label htmlFor="nombre">Nombre:</label>
                                                <input type="text" id="nombre" name="nombre" required />
                                            </div>
                                            <div>
                                                <label htmlFor="cantidad">Cantidad:</label>
                                                <input type="number" id="cantidad" name="cantidad" required />
                                            </div>
                                            <div className="PaganInputs">
                                                <h3>Personas que pagan:</h3>
                                                {personaPagan.map((persona, index) => (
                                                    <div key={index} className="PersonaPagan">
                                                        <label htmlFor={`nombrePersona${index}`}>Nombre:</label>
                                                        <select
                                                            id={`nombrePersona${index}`}
                                                            name={`usernamePersona${index}`} // Cambiado a `usernamePersona${index}`
                                                            onChange={(e) => handleSelectChange(e, index)}
                                                            required
                                                        >
                                                            <option value="">Selecciona un nombre</option>
                                                            {viaje.personas.map((personaViaje, index) => (
                                                                personaViaje.idP !== u &&
                                                                <option key={index} value={personaViaje.username}>{personaViaje.username}</option>
                                                            ))}
                                                        </select>
                                                        <label htmlFor={`cantidadPersona${index}`}>Cantidad:</label>
                                                        <input
                                                            type="number"
                                                            id={`cantidadPersona${index}`}
                                                            name={`cantidadPersona${index}`}
                                                            value={persona.cantidad}
                                                            onChange={(e) => handleCantidadChange(e, index)}
                                                            required
                                                        />
                                                        <button type="button" onClick={() => eliminarPersona(index)}>Eliminar</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={agregarPersona}>Agregar Persona</button>
                                            </div>
                                            <button type="submit">Guardar</button>
                                            <button type="button" onClick={() => {
                                                setTransMsg("")
                                                setShowForm(false)
                                            }}>Cancelar</button>
                                        </form>
                                        <div>{transMsg}</div>
                                    </div>
                                )}
                            </div>
                            <div className="ViajeCuentasGrupales">
                                <div className="ViajePersonas">Saldos
                                    {viaje.personas.map(user => (
                                        <div key={user.id} className="ViajePersona">
                                            <div className="ViajeUsername">{user.username}</div>
                                            <div className="ViajeSaldo">{user.saldo}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="ViajePendientes">Pagos pendientes
                                    {persona.pendientes.map((user, index) => (
                                        <div key={index} className="ViajePendiente">
                                            <div className="ViajeUsername">{viaje.personas.find(p => p.idP === user.idP)?.username}</div>
                                            <div className="ViajeCantidad">{user.cantidad}</div>
                                            <button type="button" onClick={() => pagar(user.idP, user.cantidad)}>Pagar</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
