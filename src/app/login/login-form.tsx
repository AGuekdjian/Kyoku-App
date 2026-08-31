"use client";
import { useActionState } from "react";
import { login } from "@/features/auth/actions";
export function LoginForm(){const[state,action,pending]=useActionState(login,{});return <form action={action} className="form-stack"><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label>{state.error&&<p className="form-error" role="alert">{state.error}</p>}<button disabled={pending}>{pending?"Ingresando…":"Ingresar"}</button></form>}
