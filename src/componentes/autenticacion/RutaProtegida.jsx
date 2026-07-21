import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export default function RutaProtegida({
  rolesPermitidos
}) {
  const { user, loading } = useAuth();

  if(loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-brand-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#826229]"></div>
      </div>
    );
  }

  //Segun cada caso
  // Si no esta registrado es Invitado
  if(!user){
    return <Navigate to="/login" replace/>;
  }

  // Si el rol no esta dentro de los permitidos redirigir al dashboard
  if(rolesPermitidos && !rolesPermitidos.includes(user.rol)){
    return <Navigate to="/" replace/>
  }

  // Si esta autenticado y tiene rol permitido 
  return <Outlet />
}