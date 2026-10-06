import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, ExternalLink, Trash2 } from 'lucide-react';

export const TableList: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTables = () => {
    setIsLoading(true);
    api
      .get('/admin/tables')
      .then((res) => setTables(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/tables', { tableNumber, capacity: Number(capacity) });
      setIsModalOpen(false);
      setTableNumber('');
      fetchTables();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create table');
    }
  };

  const showQR = async (tableId: string) => {
    try {
      const res = await api.get(`/admin/tables/${tableId}/qr`);
      setSelectedQR(res.data.data);
    } catch (err: any) {
      alert('Failed to load QR');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete table?')) return;
    try {
      await api.delete(`/admin/tables/${id}`);
      fetchTables();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete table');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tables & QR Codes</h1>
          <p className="text-sm text-slate-500">Generate unique table ordering QR codes and track seating occupancy</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Table
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((t) => (
          <div
            key={t._id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-extrabold text-lg text-slate-900">{t.tableNumber}</span>
                <Badge
                  variant={
                    t.status === 'AVAILABLE'
                      ? 'success'
                      : t.status === 'OCCUPIED'
                      ? 'danger'
                      : t.status === 'ORDER_PLACED'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {t.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mb-6">Capacity: {t.capacity} guests</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={() => showQR(t._id)}>
                <QrCode className="w-3.5 h-3.5 mr-1 text-orange-600" />
                View QR
              </Button>
              <button
                onClick={() => handleDelete(t._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Dining Table">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Table Number / Label</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              placeholder="e.g. Table 12 or Terrace-4"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Seating Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
              min={1}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Table
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Display Modal */}
      <Modal isOpen={!!selectedQR} onClose={() => setSelectedQR(null)} title={`QR Code: ${selectedQR?.tableNumber}`}>
        <div className="text-center space-y-4">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
            <div className="mx-auto bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              {selectedQR?.qrUrl && <QRCodeSVG value={selectedQR.qrUrl} size={192} level="M" />}
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Customers scanning this QR code are seated at{' '}
            <strong className="text-slate-900">{selectedQR?.tableNumber}</strong> at {selectedQR?.restaurantName}.
          </p>
          <div className="pt-2">
            <a href={selectedQR?.qrUrl} target="_blank" rel="noreferrer">
              <Button variant="primary" className="w-full">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Open Customer Menu URL
              </Button>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
