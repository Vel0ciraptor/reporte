import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Plus, X, Upload, Trash2, Edit, Eye, Car } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vehicle {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  pdf_url: string;
  status: string;
  created_at: string;
}

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setPdfFile(null);
    setImagePreview('');
    setEditingVehicle(null);
    setShowForm(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setName(vehicle.name);
    setDescription(vehicle.description || '');
    setPrice(vehicle.price?.toString() || '');
    setImagePreview(vehicle.image_url ? `/uploads/${vehicle.image_url}` : '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('El nombre es requerido');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (price) formData.append('price', price);
      if (imageFile) formData.append('image', imageFile);
      if (pdfFile) formData.append('pdf', pdfFile);

      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Vehiculo actualizado');
      } else {
        await api.post('/vehicles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Vehiculo creado');
      }

      resetForm();
      loadVehicles();
    } catch (error) {
      toast.error('Error al guardar vehiculo');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVehicle = async (id: number) => {
    if (!confirm('Eliminar este vehiculo?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success('Vehiculo eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const PlaceholderImage = ({ name }: { name: string }) => (
    <div className="w-full h-40 bg-gradient-to-br from-surface-200 to-surface-300 rounded-xl mb-3 flex flex-col items-center justify-center">
      <Car className="w-12 h-12 text-surface-400 mb-1.5" />
      <span className="text-surface-500 font-medium text-xs">{name}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-surface-800">Vehiculos</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary w-auto flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-surface-200/50">
              <h3 className="font-bold text-surface-800">
                {editingVehicle ? 'Editar Vehiculo' : 'Nuevo Vehiculo'}
              </h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-surface-200 rounded-lg transition-colors text-surface-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="label mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Toyota Corolla 2024"
                  className="input-field text-sm py-2.5"
                  required
                />
              </div>

              <div>
                <label className="label mb-1 block">Descripcion</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripcion del vehiculo..."
                  className="input-field min-h-[70px] text-sm py-2.5"
                />
              </div>

              <div>
                <label className="label mb-1 block">Precio</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Precio del vehiculo"
                  className="input-field text-sm py-2.5"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="label mb-1 block">Imagen del vehiculo</label>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-surface-300 rounded-xl p-3 text-center hover:border-primary-500/50 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-6 h-6 text-surface-500" />
                      <span className="text-surface-500 text-xs">Seleccionar imagen</span>
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label className="label mb-1 block">Ficha tecnica (PDF)</label>
                <input ref={pdfInputRef} type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="hidden" />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-surface-300 rounded-xl p-3 text-center hover:border-primary-500/50 transition-colors"
                >
                  {pdfFile ? (
                    <span className="text-emerald-400 font-medium text-xs">{pdfFile.name}</span>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-6 h-6 text-surface-500" />
                      <span className="text-surface-500 text-xs">Seleccionar PDF</span>
                    </div>
                  )}
                </button>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : editingVehicle ? 'Actualizar' : 'Crear Vehiculo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 text-surface-500">
          No hay vehiculos registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card overflow-hidden">
              {vehicle.image_url && !imageErrors[vehicle.id] ? (
                <img
                  src={`/uploads/${vehicle.image_url}`}
                  alt={vehicle.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                  onError={() => setImageErrors(prev => ({ ...prev, [vehicle.id]: true }))}
                />
              ) : (
                <PlaceholderImage name={vehicle.name} />
              )}

              <h3 className="font-semibold text-surface-800 text-sm">{vehicle.name}</h3>
              {vehicle.description && (
                <p className="text-surface-500 text-xs line-clamp-2 mt-1">{vehicle.description}</p>
              )}
              {vehicle.price && (
                <p className="text-primary-400 font-bold text-base mt-1.5">
                  {formatCurrency(vehicle.price)}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                {vehicle.pdf_url && (
                  <a
                    href={`/uploads/${vehicle.pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500/10 text-blue-400 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-500/20 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver PDF
                  </a>
                )}
                <button
                  onClick={() => startEdit(vehicle)}
                  className="flex-1 bg-blue-500/10 text-blue-400 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-500/20 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => deleteVehicle(vehicle.id)}
                  className="btn-danger text-xs py-1.5 px-2.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
