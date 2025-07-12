import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/ApiClient';

type Usuario = {
  id: string;
  correo: string;
};

type PermisoRol = {
  nombre: string;
  permisos: string[];
};

const rolMap: Record<string, number> = {
  "Administrador": 1,
  "Subastador": 2,
  "Postor": 3,
  "Soporte Tecnico": 4
};

const RolesPermisosAdmin = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permisosPorRol, setPermisosPorRol] = useState<PermisoRol[]>([]);
  const [rolesNombres, setRolesNombres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rolAsignadoUsuario, setRolAsignadoUsuario] = useState<{ [usuarioId: string]: string }>({});
  const [permisosEdit, setPermisosEdit] = useState<{ [rolNombre: string]: string }>({});
  const [permisoAgregar, setPermisoAgregar] = useState<{ [rolNombre: string]: string }>({});
  const [permisoEliminar, setPermisoEliminar] = useState<{ [rolNombre: string]: string }>({});

  const getErrorMessage = async (error: any) => {
    try {
      if (error?.message) return error.message;
      if (error?.text) return error.text;
      if (error?.json) {
        const json = await error.json();
        if (json && json.message) return json.message;
      }
      return String(error);
    } catch {
      return String(error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data: Usuario[] = await apiClient.get('/api/Usuarios/usuarios_all');
      const usuariosFiltrados = data
        .filter((u) => typeof u.correo === 'string')
        .map((u) => ({ id: u.id, correo: u.correo }));
      setUsuarios(usuariosFiltrados);

      const rolAsignadoInit: { [usuarioId: string]: string } = {};
      usuariosFiltrados.forEach((u) => {
        rolAsignadoInit[u.id] = '';
      });
      setRolAsignadoUsuario(rolAsignadoInit);
    } catch (e: any) {
      const msg = await getErrorMessage(e);
      setError(msg);
    }
  };

  const fetchPermisosPorRol = async () => {
    try {
      const data = await apiClient.get('/api/Usuarios/roles/permisos');
      setPermisosPorRol(data);
      setRolesNombres(data.map((r: PermisoRol) => r.nombre));

      const permisosTextInit: { [rol: string]: string } = {};
      data.forEach((r: PermisoRol) => {
        permisosTextInit[r.nombre] = r.permisos.join(', ');
      });
      setPermisosEdit(permisosTextInit);
    } catch (e: any) {
      const msg = await getErrorMessage(e);
      setError(msg);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchPermisosPorRol();
  }, []);

  const handleAsignarRol = async (usuarioId: string, rolNombre: string) => {
    try {
      if (!rolNombre) return alert('Selecciona un rol para asignar');
      const rolid = rolMap[rolNombre];
      if (!rolid) return alert('Rol inválido');

      await apiClient.patch(`/api/Usuarios/roles/${usuarioId}`, { rolid });

      alert('Rol asignado correctamente');
      setRolAsignadoUsuario((prev) => ({ ...prev, [usuarioId]: rolNombre }));
    } catch (e: any) {
      const msg = await getErrorMessage(e);
      alert(msg);
    }
  };

  const handleModificarPermisos = async (rolNombre: string) => {
    try {
      const permisos = permisosEdit[rolNombre]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      await apiClient.put('/api/Usuarios/roles/permisos', {
        rolPrincipal: rolNombre,
        permisos,
      });

      alert('Permisos modificados correctamente');
      fetchPermisosPorRol();
    } catch (e: any) {
      const msg = await getErrorMessage(e);
      alert(msg);
    }
  };

  const handleAgregarPermiso = async (rolNombre: string) => {
    try {
      const permiso = permisoAgregar[rolNombre]?.trim();
      if (!permiso) return alert('Ingresa un permiso para agregar');

      await apiClient.post('/api/Usuarios/roles/permisos', {
        rolPrincipal: rolNombre,
        permiso,
      });

      alert('Permiso agregado correctamente');
      setPermisoAgregar((prev) => ({ ...prev, [rolNombre]: '' }));
      fetchPermisosPorRol();
    } catch (e: any) {
      const msg = await getErrorMessage(e);
      alert(msg);
    }
  };

  const handleEliminarPermiso = async (rolNombre: string) => {
    try {
      const permiso = permisoEliminar[rolNombre]?.trim();
      if (!permiso) return alert('Ingresa un permiso para eliminar');

      await apiClient.delete('/api/Usuarios/roles/permisos', {
        rolPrincipal: rolNombre,
        permiso,
      });

      alert('Permiso eliminado correctamente');
      setPermisoEliminar((prev) => ({ ...prev, [rolNombre]: '' }));
      fetchPermisosPorRol();
    } catch (e: any) {
      const msg = await getErrorMessage(e);
      alert(msg);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Roles y Permisos</h2>
      {error && <div className="text-red-600 font-semibold mb-6">⚠ {error}</div>}

      <section>
        <h3 className="text-xl font-medium mb-3">Usuarios</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Correo</th>
              <th className="border border-gray-300 p-2 text-left">Asignar Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{u.correo}</td>
                <td className="border border-gray-300 p-2">
                  <select
                    value={rolAsignadoUsuario[u.id] || ''}
                    onChange={(e) => setRolAsignadoUsuario((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    className="border rounded p-1"
                  >
                    <option value="">-- Seleccionar rol --</option>
                    {Object.keys(rolMap).map((rol) => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAsignarRol(u.id, rolAsignadoUsuario[u.id])}
                    className="ml-2 bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition"
                  >
                    Asignar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="text-xl font-medium mb-3">Roles y Permisos</h3>
        {permisosPorRol.map((rol) => (
          <div key={rol.nombre} className="border border-gray-300 rounded p-4 mb-6 bg-gray-50">
            <h4 className="text-lg font-semibold mb-2 text-primary-700">{rol.nombre}</h4>
            <div className="mb-3">
              <label className="block font-medium mb-1">Editar permisos (separados por coma):</label>
              <textarea
                rows={3}
                className="w-full border rounded p-2"
                value={permisosEdit[rol.nombre] || ''}
                onChange={(e) => setPermisosEdit((prev) => ({ ...prev, [rol.nombre]: e.target.value }))}
              />
              <button
                onClick={() => handleModificarPermisos(rol.nombre)}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Guardar permisos
              </button>
            </div>
            <div className="mb-3">
              <label className="block font-medium mb-1">Agregar permiso:</label>
              <input
                type="text"
                className="border rounded p-1 w-full max-w-md"
                value={permisoAgregar[rol.nombre] || ''}
                onChange={(e) => setPermisoAgregar((prev) => ({ ...prev, [rol.nombre]: e.target.value }))}
                placeholder="Nuevo permiso"
              />
              <button
                onClick={() => handleAgregarPermiso(rol.nombre)}
                className="mt-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                Agregar
              </button>
            </div>
            <div>
              <label className="block font-medium mb-1">Eliminar permiso:</label>
              <input
                type="text"
                className="border rounded p-1 w-full max-w-md"
                value={permisoEliminar[rol.nombre] || ''}
                onChange={(e) => setPermisoEliminar((prev) => ({ ...prev, [rol.nombre]: e.target.value }))}
                placeholder="Permiso a eliminar"
              />
              <button
                onClick={() => handleEliminarPermiso(rol.nombre)}
                className="mt-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default RolesPermisosAdmin;
