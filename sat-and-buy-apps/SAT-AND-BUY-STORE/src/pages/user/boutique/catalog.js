import dynamic from "next/dynamic";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import {
  IoAdd, IoClose, IoPencil, IoTrash, IoCheckmarkCircle,
  IoTimeOutline, IoAlertCircleOutline, IoStorefrontOutline,
  IoImageOutline,
} from "react-icons/io5";
import BoutiqueDashboardLayout, { TYPE_CONFIG } from "@components/boutique/BoutiqueDashboardLayout";
import BoutiqueServices from "@services/BoutiqueServices";
import ProductServices from "@services/ProductServices";
import CategoryServices from "@services/CategoryServices";
import { UserContext } from "@context/UserContext";
import { notifyError, notifySuccess } from "@utils/toast";

const APPROVAL_CONFIG = {
  pending:  { label: "En attente de validation",  color: "bg-orange-100 text-orange-600", icon: IoTimeOutline },
  approved: { label: "Approuvé — visible sur le store", color: "bg-emerald-100 text-emerald-700", icon: IoCheckmarkCircle },
  rejected: { label: "Rejeté par l'administrateur", color: "bg-red-100 text-red-500", icon: IoAlertCircleOutline },
};

const defaultForm = {
  title: "", description: "", price: "", stock: "",
  category: "", type: "physical", image: [],
};

const SubmitProductModal = ({ categories, boutiqueId, editProduct, onClose, onSaved }) => {
  const [form, setForm] = useState(() => {
    if (editProduct) {
      const title = typeof editProduct.title === "string"
        ? editProduct.title
        : editProduct.title?.fr || editProduct.title?.en || "";
      const desc = typeof editProduct.description === "string"
        ? editProduct.description
        : editProduct.description?.fr || editProduct.description?.en || "";
      return {
        title: title,
        description: desc,
        price: editProduct.prices?.price ?? "",
        stock: editProduct.stock ?? "",
        category: editProduct.category?._id || editProduct.category || "",
        type: editProduct.type || "physical",
        image: editProduct.image || [],
      };
    }
    return { ...defaultForm };
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const res = await axios.post(process.env.NEXT_PUBLIC_CLOUDINARY_URL, formData);
      set("image", [res.data.secure_url]);
      notifySuccess("Image uploadée.");
    } catch {
      notifyError("Erreur lors de l'upload de l'image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return notifyError("Le titre est requis.");
    if (!form.category) return notifyError("La catégorie est requise.");
    if (!form.price || isNaN(Number(form.price))) return notifyError("Un prix valide est requis.");

    setLoading(true);
    try {
      const slug = form.title.trim()
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + "-" + Date.now();

      const payload = {
        title: { fr: form.title.trim(), en: form.title.trim() },
        description: { fr: form.description.trim(), en: form.description.trim() },
        slug,
        category: form.category,
        categories: [form.category],
        type: form.type,
        isCombination: false,
        variants: [],
        prices: {
          originalPrice: Number(form.price),
          price: Number(form.price),
          discount: 0,
        },
        stock: form.stock !== "" ? Number(form.stock) : 0,
        image: form.image,
        boutiqueId,
      };

      if (editProduct) {
        await ProductServices.updateMySubmission(editProduct._id, payload);
        notifySuccess("Produit mis à jour — repassé en attente de validation.");
      } else {
        await ProductServices.submitProduct(payload);
        notifySuccess("Produit soumis ! L'admin va l'examiner.");
      }
      onSaved();
      onClose();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Erreur lors de la soumission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="font-semibold text-gray-800">
            {editProduct ? "Modifier le produit" : "Soumettre un produit au store"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <IoClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Type */}
          <div className="flex gap-2">
            {[{ v: "physical", l: "Produit physique" }, { v: "service", l: "Service" }].map((t) => (
              <button key={t.v} type="button" onClick={() => set("type", t.v)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.type === t.v ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {t.l}
              </button>
            ))}
          </div>

          {/* Titre */}
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Titre du produit *"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />

          {/* Description */}
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Description (optionnelle)" rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 resize-none" />

          {/* Catégorie */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Catégorie *</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white">
              <option value="">-- Choisir une catégorie --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {typeof c.name === "string" ? c.name : c.name?.fr || c.name?.en || "Catégorie"}
                </option>
              ))}
            </select>
          </div>

          {/* Prix + Stock */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Prix (FCFA) *</label>
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)}
                placeholder="Ex: 5000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            {form.type === "physical" && (
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Stock</label>
                <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)}
                  placeholder="Ex: 10"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </div>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Photo du produit</label>
            <div className="flex items-center gap-3">
              {form.image?.[0] ? (
                <div className="relative flex-shrink-0">
                  <img
                    src={form.image[0]}
                    alt="preview"
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => set("image", [])}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    <IoClose />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <IoImageOutline className="text-2xl" />
                </div>
              )}
              <label className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                uploadingImage
                  ? "bg-gray-100 text-gray-400 pointer-events-none"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                {uploadingImage ? "Upload en cours…" : form.image?.[0] ? "Changer l'image" : "Choisir une image"}
              </label>
            </div>
          </div>

          {/* Note validation */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
            Votre produit sera soumis à validation par l'administrateur avant d'apparaître sur le store.
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-xl py-2.5 font-medium text-sm transition-colors">
            {loading ? "Envoi en cours…" : editProduct ? "Mettre à jour" : "Soumettre au store"}
          </button>
        </form>
      </div>
    </div>
  );
};

const BoutiqueCatalogPage = () => {
  const { state: { userInfo } } = useContext(UserContext);
  const [boutique, setBoutique] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchData = async (boutiqueObj) => {
    setLoading(true);
    try {
      const [subRes, catRes] = await Promise.all([
        ProductServices.getMySubmissions({ limit: 50 }),
        CategoryServices.getShowingCategory(),
      ]);
      setProducts(subRes.products || []);
      setCategories(Array.isArray(catRes) ? catRes : catRes?.categories || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) return;
    BoutiqueServices.getMyBoutique()
      .then((r) => {
        setBoutique(r.boutique || null);
        fetchData(r.boutique);
      })
      .catch(() => setLoading(false));
  }, [userInfo]);

  const handleDelete = async (product) => {
    if (!confirm(`Supprimer "${getTitle(product)}" ?`)) return;
    setDeleting(product._id);
    try {
      await ProductServices.deleteMySubmission(product._id);
      setProducts((p) => p.filter((x) => x._id !== product._id));
      notifySuccess("Produit supprimé.");
    } catch {
      notifyError("Erreur lors de la suppression.");
    } finally {
      setDeleting(null);
    }
  };

  const getTitle = (p) => {
    if (!p.title) return "Sans titre";
    if (typeof p.title === "string") return p.title;
    return p.title.fr || p.title.en || "Sans titre";
  };

  const config = boutique ? (TYPE_CONFIG[boutique.businessType] || TYPE_CONFIG.other) : TYPE_CONFIG.other;

  return (
    <BoutiqueDashboardLayout title={config.catalogLabel}>
      {showModal && boutique && (
        <SubmitProductModal
          categories={categories}
          boutiqueId={boutique._id}
          editProduct={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={() => fetchData(boutique)}
        />
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{config.catalogLabel}</h1>
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <IoAdd className="text-lg" /> Soumettre un produit
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-2">
          <IoStorefrontOutline className="text-lg flex-shrink-0 mt-0.5" />
          <p>Les produits approuvés par l'administrateur apparaissent automatiquement sur le store et peuvent être commandés par les visiteurs via le panier et le checkout.</p>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
            <IoStorefrontOutline className="text-4xl mx-auto mb-2" />
            <p className="text-sm font-medium mb-3">Aucun produit soumis pour l'instant</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
            >
              Soumettre votre premier produit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const approval = APPROVAL_CONFIG[product.approvalStatus] || APPROVAL_CONFIG.pending;
              const ApprovalIcon = approval.icon;
              return (
                <div key={product._id} className="bg-white rounded-2xl p-4 flex items-center gap-4">
                  {product.image?.[0] ? (
                    <img src={product.image[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {product.type === "service" ? "🛠" : "📦"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{getTitle(product)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.prices?.price != null
                        ? `${Number(product.prices.price).toLocaleString("fr-FR")} FCFA`
                        : "Prix non défini"}
                      {product.stock != null && product.type === "physical" && ` · Stock : ${product.stock}`}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${approval.color}`}>
                      <ApprovalIcon className="text-xs" />
                      {approval.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {product.approvalStatus !== "approved" && (
                      <button
                        onClick={() => { setEditProduct(product); setShowModal(true); }}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <IoPencil />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deleting === product._id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <IoTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BoutiqueDashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(BoutiqueCatalogPage), { ssr: false });
