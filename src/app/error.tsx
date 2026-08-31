"use client";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main><h1>Algo salió mal</h1><p>No pudimos completar la operación. El error fue registrado.</p><button onClick={reset}>Reintentar</button></main>}
