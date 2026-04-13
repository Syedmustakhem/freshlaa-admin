import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, Plus, Trash2, CheckCircle, XCircle, 
  Search, RefreshCw, AlertCircle, Loader2
} from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function ServiceableAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [newArea, setNewArea] = useState({
    pincode: "",
    areaName: "",
    isActive: true,
    notes: ""
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const resp = await axios.get("https://api.freshlaa.com/api/serviceability/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        setAreas(resp.data.areas);
      }
    } catch (err) {
      showToast("Failed to fetch serviceable areas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newArea.pincode) return showToast("Pincode is required", "warning");

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const resp = await axios.post("https://api.freshlaa.com/api/serviceability/admin/save", newArea, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        showToast(`Pincode ${newArea.pincode} saved!`, "success");
        setNewArea({ pincode: "", areaName: "", isActive: true, notes: "" });
        fetchAreas();
      }
    } catch (err) {
      showToast("Failed to save pincode", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (area) => {
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post("https://api.freshlaa.com/api/serviceability/admin/save", 
        { ...area, isActive: !area.isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resp.data.success) {
        showToast("Status updated", "success");
        fetchAreas();
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async (pincode) => {
    if (!window.confirm(`Are you sure you want to remove ${pincode}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.delete(`https://api.freshlaa.com/api/serviceability/admin/${pincode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success) {
        showToast("Pincode removed", "success");
        fetchAreas();
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filteredAreas = areas.filter(a => 
    a.pincode.includes(searchTerm) || 
    a.areaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <MapPin className="text-emerald-500" size={28} />
            Serviceable Areas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage pincodes where FreshLaa is active</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search pincode or area..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchAreas}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="text-emerald-500" size={20} />
              Add New Area
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Pincode *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 515591"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={newArea.pincode}
                  onChange={(e) => setNewArea({...newArea, pincode: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Area Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Indiranagar, Bangalore"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={newArea.areaName}
                  onChange={(e) => setNewArea({...newArea, areaName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Internal Notes</label>
                <textarea 
                  placeholder="Additional delivery details..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                  value={newArea.notes}
                  onChange={(e) => setNewArea({...newArea, notes: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <button 
                  type="button"
                  onClick={() => setNewArea({...newArea, isActive: !newArea.isActive})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${newArea.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newArea.isActive ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm font-bold text-slate-600">Active Service</span>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : "Save Service Area"}
              </button>
            </form>
          </div>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Loading areas...</p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-slate-300" size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">No areas found</h4>
              <p className="text-slate-500 text-sm">Add your first serviceable pincode to start delivering</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-bottom border-slate-100">
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Pincode</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Area Info</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAreas.map(area => (
                    <tr key={area.pincode} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-base">{area.pincode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{area.areaName || "Not set"}</div>
                        {area.notes && <div className="text-xs text-slate-400 mt-1 truncate max-w-xs">{area.notes}</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleStatus(area)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                            area.isActive 
                              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' 
                              : 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                          }`}
                        >
                          {area.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {area.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(area.pincode)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Active Zones: {areas.filter(a => a.isActive).length}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <AlertCircle size={12} />
                  Changes take effect immediately on mobile
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
