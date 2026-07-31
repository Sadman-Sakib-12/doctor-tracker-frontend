"use client";
import { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { patientApi, doctorApi } from "@/lib/api";
import { Patient, Doctor, QueryParams } from "@/types";
import Header from "@/components/layout/Header";
import SearchInput from "@/components/ui/SearchInput";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import PatientForm from "@/components/patients/PatientForm";

const CONDITIONS = ["stable", "critical", "recovering", "chronic", "discharged", "under observation"];
const GENDERS = ["male", "female", "other"];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 10 });
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    doctorApi.getAll({ limit: 100 }).then((r) => setDoctors(r.data.data)).catch(() => {});
  }, []);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await patientApi.getAll(params);
      setPatients(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to load patients";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleUpdate = async (data: Omit<Patient, "_id" | "createdAt" | "updatedAt">) => {
    if (!editPatient) return;
    setSaving(true);
    try {
      await patientApi.update(editPatient._id, data);
      toast.success("Patient updated");
      setEditPatient(null);
      fetchPatients();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await patientApi.delete(deleteId);
      toast.success("Patient deleted");
      setDeleteId(null);
      fetchPatients();
    } catch { toast.error("Failed to delete"); }
  };

  // ── Table body ────────────────────────────────────────────────────────────────
  const renderBody = () => {
    if (loading) return (
      <tr><td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400">Loading patients...</p>
        </div>
      </td></tr>
    );

    if (error) return (
      <tr><td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchPatients}>
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </td></tr>
    );

    if (patients.length === 0) return (
      <tr><td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <Users className="w-12 h-12 opacity-30" />
          <p className="font-medium">No patients found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </td></tr>
    );

    return patients.map((p) => (
      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
        <td className="px-4 py-3 text-gray-600">{p.age}</td>
        <td className="px-4 py-3"><Badge label={p.gender} /></td>
        <td className="px-4 py-3"><Badge label={p.condition} /></td>
        <td className="px-4 py-3 text-gray-600">
          {typeof p.doctor === "object" ? p.doctor.name : "—"}
        </td>
        <td className="px-4 py-3 text-gray-600">{p.phone || "—"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setEditPatient(p)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setDeleteId(p._id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Patients" />
      <div className="flex-1 p-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={params.search || ""}
            onChange={(s) => setParams((p) => ({ ...p, search: s, page: 1 }))}
            placeholder="Search patients..."
          />
          <select
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={params.condition || ""}
            onChange={(e) => setParams((p) => ({ ...p, condition: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Conditions</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={params.gender || ""}
            onChange={(e) => setParams((p) => ({ ...p, gender: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Genders</option>
            {GENDERS.map((g) => <option key={g} value={g} className="capitalize">{g}</option>)}
          </select>
          <div className="flex gap-2 items-center ml-auto">
            <input type="date" className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              onChange={(e) => setParams((p) => ({ ...p, startDate: e.target.value || undefined, page: 1 }))} />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              onChange={(e) => setParams((p) => ({ ...p, endDate: e.target.value || undefined, page: 1 }))} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Age", "Gender", "Condition", "Doctor", "Phone", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {renderBody()}
              </tbody>
            </table>
          </div>

          {!loading && !error && patients.length > 0 && (
            <Pagination
              page={params.page!} totalPages={totalPages}
              total={total} limit={params.limit!}
              onChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal open={!!editPatient} onClose={() => setEditPatient(null)} title="Edit Patient" size="lg">
        {editPatient && <PatientForm defaultValues={editPatient} doctors={doctors} onSubmit={handleUpdate} loading={saving} />}
      </Modal>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Patient" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this patient?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
