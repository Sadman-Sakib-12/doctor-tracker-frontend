"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { doctorApi, patientApi } from "@/lib/api";
import { Doctor, Patient, QueryParams } from "@/types";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import PatientForm from "@/components/patients/PatientForm";

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    doctorApi.getOne(id).then((r) => setDoctor(r.data.data)).catch(() => toast.error("Doctor not found"));
  }, [id]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await doctorApi.getPatients(id, params);
      setPatients(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally { setLoading(false); }
  }, [id, params]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleAdd = async (data: Omit<Patient, "_id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      await doctorApi.addPatient(id, data);
      toast.success("Patient added");
      setShowAdd(false);
      fetchPatients();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data: Omit<Patient, "_id" | "createdAt" | "updatedAt">) => {
    if (!editPatient) return;
    setSaving(true);
    try {
      await patientApi.update(editPatient._id, data);
      toast.success("Patient updated");
      setEditPatient(null);
      fetchPatients();
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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title={doctor?.name || "Doctor Detail"} />
      <div className="flex-1 p-6 space-y-6">

        {/* Back + Info */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Doctors
        </button>

        {doctor && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-gray-400">Specialization</p><p className="font-semibold mt-0.5">{doctor.specialization}</p></div>
            <div><p className="text-gray-400">Hospital</p><p className="font-semibold mt-0.5">{doctor.hospital}</p></div>
            <div><p className="text-gray-400">Phone</p><p className="font-semibold mt-0.5">{doctor.phone}</p></div>
            <div><p className="text-gray-400">Email</p><p className="font-semibold mt-0.5">{doctor.email}</p></div>
          </div>
        )}

        {/* Patients table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-800">Patients ({total})</h3>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" /> Add Patient
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : patients.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No patients yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Name","Age","Gender","Condition","Phone","Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {patients.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.age}</td>
                        <td className="px-4 py-3"><Badge label={p.gender} /></td>
                        <td className="px-4 py-3"><Badge label={p.condition} /></td>
                        <td className="px-4 py-3 text-gray-600">{p.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditPatient(p)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={params.page!} totalPages={totalPages} total={total} limit={params.limit!}
                onChange={(p) => setParams((prev) => ({ ...prev, page: p }))} />
            </>
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
