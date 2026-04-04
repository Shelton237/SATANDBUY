import { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { UserContext } from "@context/UserContext";
import {
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoSaveOutline,
  IoOpenOutline,
  IoPencilOutline,
  IoCloudUploadOutline,
  IoCloseCircle,
  IoChevronForwardOutline,
  IoChevronBackOutline,
} from "react-icons/io5";
import Layout from "@layout/Layout";
import Loading from "@components/preloader/Loading";
import BoutiqueServices from "@services/BoutiqueServices";
import { notifyError, notifySuccess } from "@utils/toast";

const BUSINESS_TYPES = [
  { value: "medical", label: "Consultation Médicale" },
  { value: "it_services", label: "Services Informatiques" },
  { value: "internet", label: "Vente de Connexion Internet" },
  { value: "clothing", label: "Vêtements & Chaussures" },
  { value: "food_beverages", label: "Jus Naturels & Alimentation" },
  { value: "naturopathy", label: "Naturopathie" },
  { value: "education", label: "Éducation" },
  { value: "beauty", label: "Beauté & Bien-être" },
  { value: "real_estate", label: "Immobilier" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Autre" },
];

const STEPS = ["Infos de base", "Contact", "Images", "Réseaux sociaux"];

const defaultForm = {
  name: "",
  description: "",
  businessType: "other",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "Cameroun",
  website: "",
  logo: "",
  coverImage: "",
  socialLinks: { facebook: "", instagram: "", twitter: "", whatsapp: "" },
};

/* ─── StepIndicator — composant stable hors du parent ─── */
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-between mb-8">
    {STEPS.map((label, i) => (
      <div key={i} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < current
                ? "bg-emerald-500 text-white"
                : i === current
                ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {i < current ? <IoCheckmarkCircle className="text-lg" /> : i + 1}
          </div>
          <span className={`text-xs mt-1 font-medium whitespace-nowrap ${i <= current ? "text-emerald-600" : "text-gray-400"}`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < current ? "bg-emerald-400" : "bg-gray-200"}`} />
        )}
      </div>
    ))}
  </div>
);

/* ─── ImageUploader — composant stable hors du parent ─── */
const ImageUploader = ({ label, value, onChange }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await BoutiqueServices.uploadImage(file);
      onChange(res.url);
      notifySuccess("Image uploadée !");
    } catch {
      notifyError("Erreur lors de l'upload de l'image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
        style={{ minHeight: 140 }}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-36 object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute top-2 right-2 bg-white rounded-full text-red-500 shadow"
            >
              <IoCloseCircle className="text-2xl" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-36 text-gray-400 gap-2">
            <IoCloudUploadOutline className="text-4xl text-emerald-400" />
            <span className="text-sm">{uploading ? "Envoi en cours…" : "Cliquez pour choisir une image"}</span>
            <span className="text-xs">JPG, PNG, WEBP · max 5 Mo</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
    </div>
  );
};

/* ─── Page principale ─── */
const MaBoutiquePage = () => {
  const { state: { userInfo } } = useContext(UserContext);
  const router = useRouter();

  const [boutique, setBoutique] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!userInfo) { router.push("/user/login"); return; }

    const load = async () => {
      setPageLoading(true);
      try {
        const res = await BoutiqueServices.getMyBoutique();
        setBoutique(res.boutique);
        setForm({
          name: res.boutique.name || "",
          description: res.boutique.description || "",
          businessType: res.boutique.businessType || "other",
          phone: res.boutique.phone || "",
          email: res.boutique.email || "",
          address: res.boutique.address || "",
          city: res.boutique.city || "",
          country: res.boutique.country || "Cameroun",
          website: res.boutique.website || "",
          logo: res.boutique.logo || "",
          coverImage: res.boutique.coverImage || "",
          socialLinks: res.boutique.socialLinks || defaultForm.socialLinks,
        });
      } catch (err) {
        if (err?.response?.status === 404) setBoutique(null);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const key = name.replace("social_", "");
      setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const next = () => {
    if (step === 0 && !form.name.trim()) {
      notifyError("Le nom de la boutique est requis.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await BoutiqueServices.createBoutique(form);
      setBoutique(res.boutique);
      notifySuccess("Boutique créée ! Elle sera visible après validation.");
    } catch (err) {
      notifyError(err?.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await BoutiqueServices.updateMyBoutique(form);
      setBoutique(res.boutique);
      setIsEditing(false);
      setStep(0);
      notifySuccess("Boutique mise à jour !");
    } catch (err) {
      notifyError(err?.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) return <Layout title="Ma Boutique"><Loading loading={true} /></Layout>;

  /* ── Rendu de l'étape courante ── */
  const renderStepContent = () => {
    if (step === 0) return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nom de la boutique *</label>
          <input
            name="name" value={form.name} onChange={handleChange}
            placeholder="Ex: Ma Super Boutique"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Type d'activité</label>
          <select name="businessType" value={form.businessType} onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white">
            {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            placeholder="Décrivez votre activité, vos produits ou services…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 resize-none" />
        </div>
      </div>
    );

    if (step === 1) return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+237 6XX XXX XXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@maboutique.cm"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ville</label>
            <input name="city" value={form.city} onChange={handleChange} placeholder="Yaoundé"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Pays</label>
            <input name="country" value={form.country} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Quartier, rue…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Site web</label>
          <input name="website" value={form.website} onChange={handleChange} placeholder="https://maboutique.cm"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-6">
        <ImageUploader label="Logo de la boutique" value={form.logo}
          onChange={(url) => setForm((prev) => ({ ...prev, logo: url }))} />
        <ImageUploader label="Photo de couverture" value={form.coverImage}
          onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))} />
      </div>
    );

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Renseignez vos liens de réseaux sociaux (optionnel).</p>
        {[
          { key: "facebook", placeholder: "https://facebook.com/maboutique" },
          { key: "instagram", placeholder: "https://instagram.com/maboutique" },
          { key: "twitter", placeholder: "https://twitter.com/maboutique" },
          { key: "whatsapp", placeholder: "+237 6XX XXX XXX" },
        ].map(({ key, placeholder }) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">{key}</label>
            <input name={`social_${key}`} value={form.socialLinks[key] || ""} onChange={handleChange}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </div>
        ))}
      </div>
    );
  };

  /* ── Navigation stepper ── */
  const renderStepperNav = (onSubmit, submitLabel) => (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
      <button type="button" onClick={prev} disabled={step === 0}
        className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30">
        <IoChevronBackOutline /> Précédent
      </button>
      {step < STEPS.length - 1 ? (
        <button type="button" onClick={next}
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Suivant <IoChevronForwardOutline />
        </button>
      ) : (
        <button type="button" onClick={onSubmit} disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:bg-gray-300">
          <IoSaveOutline />
          {saving ? "Enregistrement…" : submitLabel}
        </button>
      )}
    </div>
  );

  return (
    <Layout title="Ma Boutique">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <IoBriefcaseOutline className="text-2xl text-emerald-500" />
          <h1 className="text-xl font-bold text-gray-800">Ma Boutique</h1>
        </div>

        {!boutique ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-6">Créer votre boutique</h2>
            <StepIndicator current={step} />
            <div className="min-h-[280px]">{renderStepContent()}</div>
            {renderStepperNav(handleCreate, "Créer ma boutique")}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statut */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              boutique.status === "active" ? "bg-emerald-50 border-emerald-200"
              : boutique.status === "pending" ? "bg-amber-50 border-amber-200"
              : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                {boutique.status === "active"
                  ? <IoCheckmarkCircle className="text-emerald-500 text-xl" />
                  : <IoBriefcaseOutline className="text-amber-500 text-xl" />}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {boutique.status === "active" ? "Boutique active"
                      : boutique.status === "pending" ? "En attente de validation" : "Suspendue"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {boutique.followersCount} abonné{boutique.followersCount !== 1 ? "s" : ""} · {boutique.postsCount} post{boutique.postsCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {boutique.status === "active" && (
                  <Link href={`/boutiques/${boutique.slug}`}
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
                    <IoOpenOutline /> Voir
                  </Link>
                )}
                <button onClick={() => { setIsEditing((v) => !v); setStep(0); }}
                  className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                  <IoPencilOutline /> Modifier
                </button>
              </div>
            </div>

            {/* Formulaire d'édition */}
            {isEditing && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-700">Modifier ma boutique</h2>
                  <button type="button" onClick={() => { setIsEditing(false); setStep(0); }}
                    className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                </div>
                <StepIndicator current={step} />
                <div className="min-h-[280px]">{renderStepContent()}</div>
                {renderStepperNav(handleUpdate, "Enregistrer")}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MaBoutiquePage;
