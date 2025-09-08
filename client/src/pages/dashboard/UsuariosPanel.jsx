import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const DAILY_LIMIT = 5;
const MAIL_DOMAIN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAIL_DOMAIN) ||
  'fundacionjuanxxiii.cl';

const UsuariosPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdToday, setCreatedToday] = useState(0);

  const [form, setForm] = useState({ nombre: '' });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const [search, setSearch] = useState('');

  // Utils
  const slugify = (s = '') =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.|\.$/g, '') || 'usuario';

  const emailPreview = form.nombre
    ? `${slugify(form.nombre)}@${MAIL_DOMAIN}`
    : `usuario@${MAIL_DOMAIN}`;

  const generatePassword = () => {
    const length = 14;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%*?';
    let pass = '';
    for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  };

  const handleGenerateAndCopy = () => {
    const pass = generatePassword();
    setGeneratedPassword(pass);
    try {
      navigator.clipboard.writeText(pass);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // si falla el clipboard, igual queda en estado generado
    }
  };

  const openModal = () => {
    setGeneratedPassword(''); // no se muestra ni se prellena
    setCopied(false);
    setForm({ nombre: '' });
    setShowModal(true);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/admin/usuarios');
      if (Array.isArray(data?.usuarios)) {
        setUsers(data.usuarios);
        setCreatedToday(typeof data.createdToday === 'number' ? data.createdToday : 0);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (e) {
      setError('No se pudieron cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const canCreate = createdToday < DAILY_LIMIT;

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.nombre, u.email, u.rol, u.estado]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreate || !generatedPassword) return;
    try {
      setCreating(true);
      setError('');
      // Backend fija rol = 'contenido' y genera email final (puede añadir sufijo)
      const payload = { nombre: form.nombre, password: generatedPassword };
      const res = await api.post('/admin/usuarios', payload);
      const usuario = res?.usuario || res;
      if (usuario?.email) {
        setLastCreated(usuario); // NO guardamos ni mostramos la contraseña
        setShowModal(false);
        await loadUsers();
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      setError('Error creando usuario');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Mensaje éxito */}
          {lastCreated && (
            <div className="mb-6 p-4 rounded-md border border-emerald-300 bg-emerald-50 text-sm text-emerald-800">
              <p className="font-semibold mb-1">Usuario creado correctamente</p>
              <p>
                <span className="font-medium">Nombre:</span> {lastCreated.nombre}
              </p>
              <p>
                <span className="font-medium">Email:</span> {lastCreated.email}
              </p>
              <p>
                <span className="font-medium">Rol:</span> {lastCreated.rol}
              </p>
              <p className="mt-2 text-gray-700">
                Recuerda compartir la contraseña que generaste. Por seguridad no se almacena ni se vuelve a mostrar.
              </p>
              <button onClick={() => setLastCreated(null)} className="mt-3 inline-flex items-center text-xs text-emerald-700 hover:underline">
                Ocultar
              </button>
            </div>
          )}

          {/* Header + acciones */}
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <UserGroupIcon className="h-8 w-8 text-primary-600" /> Usuarios
              </h1>
              <p className="text-gray-600">Administración de cuentas internas</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email…"
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={openModal}
                disabled={!canCreate}
                className={`inline-flex items-center px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition-colors ${
                  canCreate ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <PlusIcon className="h-5 w-5 mr-2" /> Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Buscador en móvil */}
          <div className="md:hidden mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Límite diario */}
          <div className="mb-6 text-sm text-gray-600">
            Creados hoy: <span className="font-semibold">{createdToday}</span>/<span>{DAILY_LIMIT}</span>
            {!canCreate && <span className="text-red-600 ml-2">Límite alcanzado</span>}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

          {/* Tabla */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Usuarios Registrados</h2>
              <span className="text-xs text-gray-500">{users.length} total</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Sin usuarios adicionales</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Rol</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Último acceso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              u.rol === 'contenido'
                                ? 'bg-blue-50 text-blue-700'
                                : u.rol === 'admin'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              u.estado === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-CL') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal creación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">Crear Usuario</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded hover:bg-gray-100" aria-label="Cerrar">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <input
                    value="contenido"
                    readOnly
                    className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">El rol está fijado por política.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (previo)</label>
                  <input
                    value={emailPreview}
                    readOnly
                    className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email final puede incluir un número si existe otro igual.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <p className="text-xs text-gray-600 mb-2">
                  Por seguridad <strong>no se mostrará</strong>. Genera y se copiará al portapapeles.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAndCopy}
                    className="px-3 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                    title="Generar y copiar"
                  >
                    Generar y copiar
                  </button>
                  {generatedPassword ? (
                    <span className="text-xs text-emerald-700">
                      Generada ✓ {copied ? 'y copiada' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Aún no generada</span>
                  )}
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  Entrega esta contraseña al usuario y recomiéndale cambiarla al ingresar.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  disabled={creating || !canCreate || !generatedPassword}
                  type="submit"
                  className={`px-4 py-2 text-sm rounded-md text-white ${
                    creating
                      ? 'bg-primary-400'
                      : !generatedPassword
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {creating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPanel;
