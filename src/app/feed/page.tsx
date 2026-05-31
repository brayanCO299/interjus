'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Home, Users, Bell, Image as ImageIcon, Video, ThumbsUp, MessageSquare, Send, X, Search, Activity, Briefcase, MapPin, Calendar } from 'lucide-react';
import UserBadge, { AreaName } from '@/components/UserBadge';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter();
    const [usuarioSesion, setUsuarioSesion] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [nuevoTexto, setNuevoTexto] = useState('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [cargando, setCargando] = useState(false);
    const [comentandoPostId, setComentandoPostId] = useState<number | null>(null);
    const [textoComentario, setTextoComentario] = useState<{ [key: number]: string }>({});
    const [cumpleaneros, setCumpleaneros] = useState<any[]>([]);
    const [notificaciones, setNotificaciones] = useState<number>(0);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
    const [mostrarMenuNotificaciones, setMostrarMenuNotificaciones] = useState(false);
    const [listaNotificaciones, setListaNotificaciones] = useState<any[]>([]);

    // ESTADOS DE LA NUEVA SECCIÓN DE ACTIVIDADES
    const [actividades, setActividades] = useState<any[]>([]);
    const [nuevaActividadTitulo, setNuevaActividadTitulo] = useState('');
    const [nuevaActividadFecha, setNuevaActividadFecha] = useState('');
    const [guardandoActividad, setGuardandoActividad] = useState(false);

    const totalPostsPrevio = useRef<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = localStorage.getItem('interjus_user');
        if (user) {
            setUsuarioSesion(JSON.parse(user));
            cargarPosts(true);
            cargarCumpleaneros();
            cargarActividades(); // Carga las actividades al iniciar
        } else {
            router.push('/');
        }
    }, [router]);

    // Monitoreo en tiempo real cada 8 segundos
    useEffect(() => {
        const intervalo = setInterval(() => {
            if (usuarioSesion) {
                cargarPosts(false);
                cargarActividades(); // Refresca actividades en segundo plano
            }
        }, 8000);
        return () => clearInterval(intervalo);
    }, [usuarioSesion, posts.length]);

    const cargarPosts = async (esInicial = false) => {
        try {
            const userString = localStorage.getItem('interjus_user');
            if (!userString) return;
            const user = JSON.parse(userString);

            const res = await fetch(`/api/posts?usuario_id=${user.id}`);
            const data = await res.json();

            if (data.success) {
                if (!esInicial && data.posts.length > totalPostsPrevio.current) {
                    const diferencia = data.posts.length - totalPostsPrevio.current;
                    setNotificaciones(prev => prev + diferencia);
                }
                setPosts(data.posts);
                totalPostsPrevio.current = data.posts.length;
            }
        } catch (e) {
            console.error("Error cargando publicaciones:", e);
        }
    };

    const cargarCumpleaneros = async () => {
        try {
            const res = await fetch('/api/usuarios/cumpleanos');
            const data = await res.json();
            if (data.success) setCumpleaneros(data.cumpleaneros);
        } catch (error) {
            console.error("Error al cargar onomásticos:", error);
        }
    };

    const cargarActividades = async () => {
        try {
            const res = await fetch('/api/actividades');
            const data = await res.json();
            if (data.success) {
                setActividades(data.actividades);

                // Recuperamos las actividades que ya fueron dadas por leídas
                const vistasString = localStorage.getItem('interjus_actividades_vistas');
                const idsVistas: number[] = vistasString ? JSON.parse(vistasString) : [];

                // Filtramos alertas de actividades (Hoy o Mañana) que no hayan sido visualizadas
                const pendientes = data.actividades.filter((act: any) =>
                    (act.recordar_manana || act.es_hoy) && !idsVistas.includes(act.id)
                );

                setListaNotificaciones(pendientes);
                setNotificaciones(pendientes.length);
            }
        } catch (error) {
            console.error("Error al cargar actividades:", error);
        }
    };
    const publicarContenido = async () => {
        if (!nuevoTexto.trim() && !archivo) return;
        setCargando(true);

        try {
            let multimediaUrl = null;
            let tipoMedia = null;

            if (archivo) {
                const formData = new FormData();
                formData.append('file', archivo);

                const resUpload = await fetch('/api/upload', { method: 'POST', body: formData });
                const dataUpload = await resUpload.json();
                if (dataUpload.success) {
                    multimediaUrl = dataUpload.url;
                    tipoMedia = archivo.type.startsWith('video/') ? 'video' : 'foto';
                } else {
                    alert('Error al subir el archivo multimedia.');
                    setCargando(false);
                    return;
                }
            }

            const resPost = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuarioSesion.id,
                    texto: nuevoTexto,
                    multimedia_url: multimediaUrl,
                    tipo_media: tipoMedia
                })
            });

            if (resPost.ok) {
                setNuevoTexto('');
                setArchivo(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                await cargarPosts(true);
            }
        } catch (error) {
            console.error("Error al publicar:", error);
        } finally {
            setCargando(false);
        }
    };

    const registrarActividad = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaActividadTitulo.trim() || !nuevaActividadFecha) return;
        setGuardandoActividad(true);

        try {
            const res = await fetch('/api/actividades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: nuevaActividadTitulo,
                    fecha_hora: nuevaActividadFecha,
                    usuario_id: usuarioSesion.id
                })
            });

            if (res.ok) {
                setNuevaActividadTitulo('');
                setNuevaActividadFecha('');
                await cargarActividades();
            }
        } catch (error) {
            console.error("Error al registrar actividad:", error);
        } finally {
            setGuardandoActividad(false);
        }
    };

    const reaccionar = async (post_id: number) => {
        await fetch('/api/reacciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id, usuario_id: usuarioSesion.id })
        });
        cargarPosts(true);
    };

    const comentar = async (post_id: number) => {
        if (!textoComentario[post_id]?.trim()) return;
        await fetch('/api/comentarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id, usuario_id: usuarioSesion.id, texto: textoComentario[post_id] })
        });
        setTextoComentario(prev => ({ ...prev, [post_id]: '' }));
        setComentandoPostId(null);
        cargarPosts(true);
    };

    const abrirPerfilDetallado = (nombre: string, area: string) => {
        setUsuarioSeleccionado({ nombres: nombre, area: area || 'SNEJ Sede Huampami' });
    };

    if (!usuarioSesion) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <span className="text-xl font-bold text-red-900 tracking-widest animate-pulse">Cargando InterJus...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white border-b h-14 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-black text-red-900 tracking-tight">InterJus</h1>

                    {/* Filtros Administrativos Protegidos */}
                    {usuarioSesion?.rol?.toUpperCase() === 'ADMIN' && (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
                                <input type="text" placeholder="Buscar usuarios..." className="bg-gray-100 pl-9 pr-3 py-1.5 rounded-full text-sm outline-none w-64 text-black" />
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                                <Activity size={16} className="text-gray-500" />
                                <select className="bg-transparent outline-none text-gray-600 font-medium cursor-pointer">
                                    <option>Estado: Activo</option>
                                    <option>Estado: En revisión</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notificaciones y Perfil */}
               {/* 1. BUSCA ESTA SECCIÓN DENTRO DE TU <header> */}
<div className="flex items-center gap-4">

    {/* REEMPLAZA EL BOTÓN ANTERIOR POR TODO ESTE BLOQUE COMPLETO */}
    <div className="relative">
        <button 
            onClick={() => {
                setMostrarMenuNotificaciones(!mostrarMenuNotificaciones);
                if (notificaciones > 0) {
                    // Al abrir, marcamos las alertas actuales como leídas en el LocalStorage
                    const idsActuales = listaNotificaciones.map((a: any) => a.id);
                    const vistasString = localStorage.getItem('interjus_actividades_vistas');
                    const idsVistas: number[] = vistasString ? JSON.parse(vistasString) : [];
                    
                    const unificados = Array.from(new Set([...idsVistas, ...idsActuales]));
                    localStorage.setItem('interjus_actividades_vistas', JSON.stringify(unificados));
                    setNotificaciones(0);
                }
            }} 
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
            title="Notificaciones"
        >
            <Bell size={22} className={notificaciones > 0 ? "text-red-900 animate-pulse" : ""} />
            {notificaciones > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {notificaciones}
                </span>
            )}
        </button>

        {/* MENÚ DESPLEGABLE FLOTANTE (Aparece al hacer clic) */}
        {mostrarMenuNotificaciones && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-black text-xs text-gray-800 uppercase tracking-wider">Alertas de Actividades</span>
                    <button onClick={() => setMostrarMenuNotificaciones(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    {listaNotificaciones.length > 0 ? (
                        listaNotificaciones.map((notif: any) => (
                            <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${notif.es_hoy ? 'bg-red-600' : 'bg-amber-500'}`} />
                                    <span className="text-xs font-black text-gray-900">{notif.titulo}</span>
                                </div>
                                <span className="text-[11px] font-medium text-gray-500 pl-3.5">
                                    {notif.es_hoy ? '🚨 Programado para HOY' : '📅 Recordatorio: Mañana'} a las {new Date(notif.fecha_limpia).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 italic text-center py-6">No tienes alertas pendientes de actividades.</p>
                    )}
                </div>
            </div>
        )}
    </div>

    {/* CÍRCULO DEL AVATAR DEL USUARIO (DEJA ESTO TAL CUAL LO TIENES) */}
    <div onClick={() => { localStorage.clear(); router.push('/'); }} className="w-9 h-9 rounded-full bg-red-900 text-white flex items-center justify-center font-bold cursor-pointer hover:bg-red-950 transition uppercase text-sm">
        {usuarioSesion.nombres?.charAt(0) || 'U'}
    </div>

</div>
            </header>

            {/* Layout de Dos Columnas */}
            <main className="max-w-5xl mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                {/* COLUMNA PRINCIPAL DE PUBLICACIONES */}
                <div className="md:col-span-2 space-y-6">
                    {/* Caja de publicar con Foto y Video */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <textarea
                            className="w-full bg-gray-100 p-3 rounded-lg text-sm mb-3 focus:outline-none text-black resize-none"
                            placeholder={usuarioSesion?.nombres ? `¿Qué deseas compartir, ${usuarioSesion.nombres.split(' ')[0]}?` : "@Compartir"}
                            value={nuevoTexto}
                            onChange={(e) => setNuevoTexto(e.target.value)}
                            disabled={cargando}
                        />

                        <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files && e.target.files[0]) setArchivo(e.target.files[0]); }} accept="image/*,video/*" className="hidden" />

                        {archivo && (
                            <div className="relative mb-3 inline-flex items-center gap-2 bg-gray-100 p-2 rounded-lg text-xs font-medium text-gray-700">
                                <span>📁 {archivo.name}</span>
                                <button onClick={() => { setArchivo(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition"><X size={12} /></button>
                            </div>
                        )}

                        <div className="flex gap-4 border-t pt-3">
                            <button onClick={() => fileInputRef.current?.click()} disabled={cargando} className="flex items-center gap-2 text-gray-600 hover:text-red-900 font-medium text-sm transition"><ImageIcon size={18} className="text-green-600" /> Foto</button>
                            <button onClick={() => fileInputRef.current?.click()} disabled={cargando} className="flex items-center gap-2 text-gray-600 hover:text-red-900 font-medium text-sm transition"><Video size={18} className="text-red-600" /> Video</button>
                            <button onClick={publicarContenido} disabled={cargando || (!nuevoTexto.trim() && !archivo)} className="ml-auto bg-red-900 text-white px-6 py-1.5 rounded-full font-bold text-sm hover:bg-red-950 transition disabled:opacity-50">{cargando ? 'Publicando...' : 'Publicar'}</button>
                        </div>
                    </div>

                    {/* Muro de Publicaciones */}
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm border p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase shadow-sm">
                                    {post.autor_nombre?.charAt(0) || '?'}
                                </div>
                                <div className="flex flex-col">
                                    <div onClick={() => abrirPerfilDetallado(post.autor_nombre, post.autor_area)} className="cursor-pointer hover:underline">
                                        <UserBadge name={post.autor_nombre} area={post.autor_area as AreaName} />
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {post.texto && <p className="text-gray-800 mb-4 whitespace-pre-wrap text-sm">{post.texto}</p>}

                            {post.multimedia_url && (
                                <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                                    {post.tipo_media === 'video' ? (
                                        <video controls className="w-full h-auto max-h-[450px] object-cover" src={post.multimedia_url} />
                                    ) : (
                                        <img src={post.multimedia_url} alt="Media" className="w-full h-auto max-h-[450px] object-cover" />
                                    )}
                                </div>
                            )}

                            {/* Botones de Reacción e Interacción */}
                            <div className="flex justify-around border-t pt-3">
                                <button onClick={() => reaccionar(post.id)} className={`flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded text-xs font-bold transition ${post.dio_like ? 'text-blue-600 font-black' : 'text-gray-600'}`}>
                                    <ThumbsUp size={18} className={post.dio_like ? 'fill-blue-600 text-blue-600' : ''} /> Me gusta ({post.total_likes || 0})
                                </button>
                                <button onClick={() => setComentandoPostId(comentandoPostId === post.id ? null : post.id)} className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded text-xs font-bold text-gray-600 transition">
                                    <MessageSquare size={18} /> Comentar
                                </button>
                            </div>

                            {/* Caja de comentarios integrados */}
                            {post.comentarios && post.comentarios.length > 0 && (
                                <div className="mt-4 space-y-2 border-t pt-3">
                                    {post.comentarios.map((com: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-2 rounded-lg text-xs">
                                            <span className="font-bold text-red-900">{com.autor_comentario}: </span>
                                            <span className="text-gray-800">{com.contenido}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {comentandoPostId === post.id && (
                                <div className="flex gap-2 mt-3">
                                    <input className="bg-gray-100 p-2 rounded-full flex-1 px-4 text-xs outline-none border text-black" value={textoComentario[post.id] || ''} onChange={(e) => setTextoComentario({ ...textoComentario, [post.id]: e.target.value })} placeholder="Escribe tu comentario..." />
                                    <button onClick={() => comentar(post.id)} className="bg-red-900 text-white p-2 rounded-full hover:bg-red-950 transition"><Send size={14} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* COLUMNA DERECHA COMPARTIDA: ONOMÁSTICOS Y ACTIVIDADES DESCENTRALIZADAS */}
                <div className="sticky top-20 space-y-6 w-full">

                    {/* Sección Onomásticos */}
                    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
                        <h4 className="font-black text-gray-800 text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
                            <span className="animate-bounce inline-block">🎂</span> Onomásticos de Hoy
                        </h4>
                        {cumpleaneros.length > 0 ? (
                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                                {cumpleaneros.map((usuario: any, idx: number) => (
                                    <div key={idx} onClick={() => abrirPerfilDetallado(usuario.nombres, usuario.area)} className="group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-orange-50/70 to-amber-50/40 border border-orange-100 hover:border-orange-300 transition shadow-sm hover:shadow-md cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black flex items-center justify-center text-sm shadow-md relative">
                                            {usuario.nombres?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-black text-sm text-gray-800">{usuario.nombres}</span>
                                            <span className="text-xs text-orange-700 font-semibold tracking-wide mt-0.5">🎉 {usuario.area || 'Amazonas'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<p className="text-xs text-gray-400 italic text-center">No hay onomásticos.</p>)}
                    </div>

                    {/* Sección Actividades Integradas para todos los usuarios */}
                    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-indigo-800 to-red-900" />
                        <h4 className="font-black text-gray-800 text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
                            <span>📅</span> Actividades de Áreas
                        </h4>

                        <form onSubmit={registrarActividad} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5">
                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Informar Nueva Actividad</p>
                            <input type="text" placeholder="Ej: Diligencia SNEJ, Inventario..." value={nuevaActividadTitulo} onChange={(e) => setNuevaActividadTitulo(e.target.value)} className="w-full bg-white border p-2 rounded-lg text-xs outline-none text-black focus:ring-1 focus:ring-blue-900" required />
                            <input type="datetime-local" value={nuevaActividadFecha} onChange={(e) => setNuevaActividadFecha(e.target.value)} className="w-full bg-white border p-2 rounded-lg text-xs outline-none text-black focus:ring-1 focus:ring-blue-900 cursor-pointer" required />
                            <button type="submit" disabled={guardandoActividad} className="w-full bg-blue-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-950 transition">Añadir Actividad</button>
                        </form>

                        {actividades.length > 0 ? (
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                {/* Dentro del mapeo de actividades, modifica la lectura de fechas: */}
                                {actividades.map((act: any) => {
                                    // Usamos la propiedad formateada limpia que viene del backend
                                    const fechaObj = new Date(act.fecha_limpia);
                                    return (
                                        <div key={act.id} className={`flex items-start gap-3 p-2.5 rounded-lg border transition ${act.es_hoy ? 'bg-red-50/60 border-red-200' : act.recordar_manana ? 'bg-amber-50/70 border-amber-300' : 'border-gray-100 bg-gray-50/50'}`}>
                                            <div className={`rounded-lg p-1.5 min-w-[55px] text-center ${act.es_hoy ? 'bg-red-900 text-white' : act.recordar_manana ? 'bg-amber-600 text-white' : 'bg-red-900/10 text-red-900'}`}>
                                                <span className="text-xs font-black leading-none">{fechaObj.toLocaleDateString('es-PE', { day: '2-digit' })}</span>
                                                <span className="text-[10px] font-bold uppercase mt-0.5 block">{fechaObj.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-bold text-gray-800 break-words leading-tight">{act.titulo}</p>
                                                    {act.es_hoy && <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Hoy</span>}
                                                    {act.recordar_manana && <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Mañana</span>}
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-medium mt-1">⏰ {fechaObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (<p className="text-xs text-gray-400 italic text-center">No hay actividades.</p>)}
                    </div>
                </div>
            </main>

            {/* Modal de Perfil Detallado Restablecido */}
            {usuarioSeleccionado && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative animate-in zoom-in-95 duration-200">
                        <div className="h-28 bg-gradient-to-r from-red-950 via-red-900 to-amber-900 relative" />
                        <button onClick={() => setUsuarioSeleccionado(null)} className="absolute top-3 right-3 bg-white/20 text-white p-1.5 rounded-full hover:bg-white/40"><X size={18} /></button>
                        <div className="px-6 pb-6 relative pt-12">
                            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-black text-3xl flex items-center justify-center uppercase absolute -top-10 left-6 border-4 border-white shadow-md">
                                {usuarioSeleccionado.nombres?.charAt(0)}
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{usuarioSeleccionado.nombres}</h3>
                            <p className="text-xs font-bold text-red-900 uppercase tracking-wider mt-0.5">Colegiado Habilitado</p>
                            <hr className="my-4 border-gray-100" />
                            <div className="space-y-3.5 text-sm text-gray-700">
                                <div className="flex items-center gap-3"><Briefcase size={16} className="text-gray-400" /><span>Área / Sede: <strong className="text-gray-900 font-semibold">{usuarioSeleccionado.area}</strong></span></div>
                                <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-400" /><span>Jurisdicción: <span className="text-gray-900 font-medium">Distrito Judicial de Amazonas</span></span></div>
                                <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-400" /><span>Institución: <span className="text-gray-600">Corte Superior de Justicia</span></span></div>
                            </div>
                            <button onClick={() => setUsuarioSeleccionado(null)} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl text-sm font-bold transition">Cerrar Perfil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}