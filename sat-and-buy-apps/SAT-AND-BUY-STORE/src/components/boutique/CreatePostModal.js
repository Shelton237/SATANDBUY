import { useState, useRef } from "react";
import { IoClose, IoImage, IoSend, IoCloseCircle } from "react-icons/io5";
import BoutiqueServices from "@services/BoutiqueServices";
import { notifyError, notifySuccess } from "@utils/toast";

const POST_TYPES = [
  { value: "post", label: "Publication" },
  { value: "offer", label: "Offre" },
  { value: "event", label: "Événement" },
  { value: "news", label: "Actualité" },
];

const MAX_IMAGES = 5;

// Each entry: { id, localUrl, serverUrl, uploading }
const CreatePostModal = ({ boutique, onClose, onCreated }) => {
  const [content, setContent] = useState("");
  const [type, setType] = useState("post");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadingCount = images.filter((img) => img.uploading).length;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      notifyError(`Maximum ${MAX_IMAGES} images par post.`);
    }

    // Add entries with local preview immediately
    const newEntries = toUpload.map((file) => ({
      id: crypto.randomUUID(),
      localUrl: URL.createObjectURL(file),
      serverUrl: null,
      uploading: true,
      file,
    }));

    setImages((prev) => [...prev, ...newEntries]);

    // Upload each file, update serverUrl when done
    newEntries.forEach(async (entry) => {
      try {
        const res = await BoutiqueServices.uploadImage(entry.file);
        setImages((prev) =>
          prev.map((img) =>
            img.id === entry.id
              ? { ...img, serverUrl: res.url, uploading: false }
              : img
          )
        );
      } catch {
        notifyError(`Erreur lors de l'upload.`);
        setImages((prev) => prev.filter((img) => img.id !== entry.id));
        URL.revokeObjectURL(entry.localUrl);
      }
    });

    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const entry = prev.find((img) => img.id === id);
      if (entry?.localUrl) URL.revokeObjectURL(entry.localUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return notifyError("Le contenu est requis.");
    if (uploadingCount > 0) return notifyError("Attendez la fin de l'upload.");
    setLoading(true);
    try {
      const serverImages = images.map((img) => img.serverUrl).filter(Boolean);
      const res = await BoutiqueServices.createPost({ content: content.trim(), type, images: serverImages });
      notifySuccess("Publication créée !");
      onCreated(res.post);
      onClose();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="font-semibold text-gray-800">Nouvelle publication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Body scrollable */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Auteur + type */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
              {boutique?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800">{boutique?.name}</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="text-xs text-emerald-600 bg-emerald-50 rounded px-1 py-0.5 border-none outline-none cursor-pointer"
              >
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contenu */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Quoi de neuf chez ${boutique?.name} ?`}
            rows={4}
            className="w-full text-sm text-gray-700 resize-none outline-none border-none bg-transparent placeholder-gray-400"
          />

          {/* Aperçu images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={img.localUrl} alt="" className="w-full h-full object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/70"
                  >
                    <IoCloseCircle className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bouton ajout image */}
          {images.length < MAX_IMAGES && (
            <div className="border-t pt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCount > 0}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 transition-colors disabled:opacity-40"
              >
                <IoImage className="text-xl" />
                {uploadingCount > 0
                  ? `Upload en cours… (${uploadingCount})`
                  : `Ajouter des photos (${images.length}/${MAX_IMAGES})`}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Bouton publier */}
          <button
            type="submit"
            disabled={loading || !content.trim() || uploadingCount > 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-xl py-2.5 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <IoSend />
            {loading ? "Publication en cours…" : "Publier"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
