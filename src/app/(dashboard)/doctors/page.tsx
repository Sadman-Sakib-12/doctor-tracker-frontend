"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import { doctorApi } from "@/lib/api";
import { Doctor, QueryParams } from "@/types";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import DoctorForm from "@/components/doctors/DoctorForm";
import { useRouter } from "next/navigation";

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 10 });
  const [showCreate, setShowCreate] = useState(false);
  const [editDoc, setEditDoc] = useState<Doctor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await doctorApi.getAll(params);
      setDoctors(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch { toast.error("Failed to load doctors"); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleCreate = async (data: Omit<Doctor, "_id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      await doctorApi.create(data);
      toast.success("Doctor created");
      setShowCreate(false);
      fetchDoctors();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data: Omit<Doctor, "_id" | "createdAt" | "updatedAt">) => {
    if (!editDoc) return;
    setSaving(true);
    try {
      await doctorApi.update(editDoc._id, data);
      toast.success("Doctor updated");
      setEditDoc(null);
      fetchDoctors();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await doctorApi.delete(deleteId);
      toast.success("Doctor deleted");
      setDeleteId(null);
      fetchDoctors();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Doctors" />
      <div className="flex-1 p-6 space-y-4">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <SearchInput
            value={params.search || ""}
            onChange={(s) => setParams((p) => ({ ...p, search: s, page: 1 }))}
            placeholder="Search doctors..."
          />
          <div className="flex gap-2 sm:ml-auto">
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={params.sort || "-createdAt"}
              onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value }))}
            >
              <option value="-createdAt">Newest first</option>
              <option value="createdAt">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Add Doctor
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Stethoscope className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-medium">No doctors found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Name","Specialization","Hospital","Phone","Email","Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {doctors.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{doc.name}</td>
                        <td className="px-4 py-3 text-gray-600">{doc.specialization}</td>
                        <td className="px-4 py-3 text-gray-600">{doc.hospital}</td>
                        <td className="px-4 py-3 text-gray-600">{doc.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{doc.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => router.push(`/doctors/${doc._id}`)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditDoc(doc)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(doc._id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={params.page!} totalPages={totalPages}
                total={total} limit={params.limit!}
                onChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
              />
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Doctor" size="lg">
        <DoctorForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title="Edit Doctor" size="lg">
        {editDoc && <DoctorForm defaultValues={editDoc} onSubmit={handleUpdate} loading={saving} />}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Doctor" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this doctor? This will also delete all their patients.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
