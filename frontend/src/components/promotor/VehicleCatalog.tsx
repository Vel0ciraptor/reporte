import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Eye, MessageCircle, X, Car, Info } from 'lucide-react';

interface Vehicle {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  pdf_url: string;
  status: string;
}

export default function VehicleCatalog() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.filter((v: Vehicle) => v.status === 'disponible'));
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsApp = (vehicle: Vehicle) => {
    const message = encodeURIComponent(
      `Te interesta este vehiculo de Automotors!\n\n` +
      `Vehiculo: ${vehicle.name}\n` +
      (vehicle.price ? `Precio: ${formatCurrency(vehicle.price)}\n` : '') +
      `\n${vehicle.description || ''}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const PlaceholderImage = ({ name }: { name: string }) => (
    <div className="w-full h-40 bg-gradient-to-br from-surface-200 to-surface-300 rounded-xl mb-3 flex flex-col items-center justify-center">
      <Car className="w-12 h-12 text-surface-400 mb-1.5" />
      <span className="text-surface-500 font-medium text-xs">{name}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-surface-800">Catalogo de Vehiculos</h2>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 text-surface-500">
          No hay vehiculos disponibles
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="card overflow-hidden cursor-pointer hover:border-primary-500/30 transition-all"
              onClick={() => { setSelectedVehicle(vehicle); setShowDetail(true); }}
            >
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
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedVehicle(vehicle); setShowPDF(true); }}
                    className="flex-1 bg-blue-500/10 text-blue-400 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-500/20 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver Ficha
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); sendWhatsApp(vehicle); }}
                  className="flex-1 bg-emerald-500/10 text-emerald-400 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-emerald-500/20 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Enviar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetail && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="bg-surface-100 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-surface-200/50" onClick={(e) => e.stopPropagation()}>
            {selectedVehicle.image_url && !imageErrors[selectedVehicle.id] ? (
              <img
                src={`/uploads/${selectedVehicle.image_url}`}
                alt={selectedVehicle.name}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-56 bg-gradient-to-br from-surface-200 to-surface-300 flex flex-col items-center justify-center">
                <Car className="w-16 h-16 text-surface-400 mb-2" />
                <span className="text-surface-500 font-medium text-sm">{selectedVehicle.name}</span>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-surface-800 text-xl">{selectedVehicle.name}</h3>
                <button onClick={() => setShowDetail(false)} className="p-1.5 hover:bg-surface-200 rounded-lg transition-colors text-surface-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedVehicle.price && (
                <p className="text-primary-400 font-bold text-2xl mb-4">
                  {formatCurrency(selectedVehicle.price)}
                </p>
              )}

              {selectedVehicle.description && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-gold-400" />
                    <span className="label">Descripcion</span>
                  </div>
                  <p className="text-surface-600 text-sm leading-relaxed">{selectedVehicle.description}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {selectedVehicle.pdf_url && (
                  <button
                    onClick={() => { setShowDetail(false); setShowPDF(true); }}
                    className="flex-1 bg-blue-500/10 text-blue-400 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all"
                  >
                    <Eye className="w-4 h-4" /> Ver Ficha Tecnica
                  </button>
                )}
                <button
                  onClick={() => sendWhatsApp(selectedVehicle)}
                  className="flex-1 btn-whatsapp flex items-center justify-center gap-2 text-sm py-3"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPDF && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowPDF(false)}>
          <div className="bg-surface-100 rounded-t-3xl sm:rounded-2xl w-full max-w-lg h-[85vh] flex flex-col border border-surface-200/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-surface-200/50">
              <h3 className="font-bold text-surface-800">{selectedVehicle.name}</h3>
              <div className="flex gap-2">
                {selectedVehicle.pdf_url && (
                  <a
                    href={`/uploads/${selectedVehicle.pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    Abrir PDF
                  </a>
                )}
                <button onClick={() => setShowPDF(false)} className="p-1.5 hover:bg-surface-200 rounded-lg transition-colors text-surface-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {selectedVehicle.pdf_url ? (
              <iframe src={`/uploads/${selectedVehicle.pdf_url}`} className="flex-1 w-full" title="Ficha tecnica" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-surface-500">
                <Car className="w-20 h-20 text-surface-300 mb-3" />
                <p className="text-base font-medium">Sin ficha tecnica</p>
                <p className="text-xs">No hay PDF disponible</p>
              </div>
            )}

            <div className="p-4 border-t border-surface-200/50">
              <button
                onClick={() => sendWhatsApp(selectedVehicle)}
                className="btn-whatsapp w-full flex items-center justify-center gap-2 text-sm py-2.5"
              >
                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
