"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { doctorApi, patientApi } from "@/lib/api";
import { Doctor, Patient, QueryParams, PaginatedResponse } from "@/types";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import PatientForm from "@/components/patients/PatientForm";
import { useFetch } from "@/hooks/useFetch";

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patientParams, setPatientParams] = useState<QueryParams>({ page: 1, limit: 10 });
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    doctorApi.getOne(id).then((r) => setDoctor(r.data.data)).catch(() => toast.error("Doctor not found"));
  }, [id]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Patient>>(
    (p) => doctorApi.getPatients(id, p as QueryParams).then((r) => r.data),
    patientParams as unknown as Record<string, unknown>
  );

  const patients = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Track previous patientParams key to avoid first-render double-fetch
  const prevKey = useRef("");
  const currentKey = JSON.stringify(patientParams);
  if (prevKey.current !== currentKey) prevKey.current = currentKey;

  const handleAdd = async (formData: Omit<Patient, "_id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      await doctorApi.addPatient(id, formData);
      toast.success("Patient added");
      setShowAdd(false);
      refetch();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (formData: Omit<Patient, "_id" | "createdAt" | "updatedAt">) => {
    if (!editPatient) return;
    setSaving(true);
    try {
      await patientApi.update(editPatient._id, formData);
      toast.success("Patient updated");
      setEditPatient(null);
      refetch();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await patientApi.delete(deleteId);
      toast.success("Patient deleted");
      setDeleteId(null);
      refetch();
    } catch { toast.error("Failed to delete"); }
  };

  const renderBody = () => {
    if (loading) return (
      <tr><td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400">Loading patients...</p>
        </div>
      </td></tr>
    );
    if (error) return (
      <tr><td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-red-500 font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={refetch}><RefreshCw className="w-4 h-4" /> Retry</Button>
        </div>
      </td></tr>
    );
    if (patients.length === 0) return (
      <tr><td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <Users className="w-10 h-10 opacity-30" />
          <p className="font-medium">No patients yet</p>
          <p className="text-sm">Add the first patient using the button above</p>
        </div>
      </td></tr>
    );
    return patients.map((p) => (
      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
        <td className="px-4 py-3 text-gray-600">{p.age}</td>
        <td className="px-4 py-3"><Badge label={p.gender} /></td>
        <td className="px-4 py-3"><Badge label={p.condition} /></td>
        <td className="px-4 py-3 text-gray-600">{p.phone || "—"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setEditPatient(p)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title={doctor?.name ?? "Doctor Detail"} />
      <div className="flex-1 p-6 space-y-6">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Doctors
        </button>

        {/* Doctor info card */}
        {doctor && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">{doctor.name[0]}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{doctor.name}</h2>
                <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">Hospital</p>
                <p className="font-semibold text-gray-800">{doctor.hospital}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">Phone</p>
                <p className="font-semibold text-gray-800">{doctor.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 col-span-2 sm:col-span-1">
                <p className="text-gray-400 text-xs mb-1">Email</p>
                <p className="font-semibold text-gray-800 truncate">{doctor.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Patients table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Patients <span className="text-gray-400 font-normal text-sm">({total})</span></h3>
            <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Patient</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Name","Age","Gender","Condition","Phone","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">{renderBody()}</tbody>
            </table>
          </div>
          {!loading && !error && patients.length > 0 && (
            <Pagination page={patientParams.page!} totalPages={totalPages} total={total} limit={patientParams.limit!}
              onChange={(p) => setPatientParams((prev) => ({ ...prev, page: p }))} />
          )}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Patient" size="lg">
        <PatientForm fixedDoctorId={id} onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={!!editPatient} onClose={() => setEditPatient(null)} title="Edit Patient" size="lg">
        {editPatient && <PatientForm defaultValues={editPatient} fixedDoctorId={id} onSubmit={handleUpdate} loading={saving} />}
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
