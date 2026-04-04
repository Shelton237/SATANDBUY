import Image from "next/image";
import { useState, useContext } from "react";
import { IoHeartOutline, IoHeart, IoChatbubbleOutline, IoShareOutline, IoEllipsisHorizontal } from "react-icons/io5";
import { UserContext } from "@context/UserContext";
import { notifyError, notifySuccess } from "@utils/toast";
import BoutiqueServices from "@services/BoutiqueServices";
import CommentSection from "./CommentSection";

const POST_TYPE_LABELS = {
  post: null,
  offer: "Offre",
  event: "Événement",
  news: "Actualité",
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const PostCard = ({ post: initialPost, boutique }) => {
  const { state: { userInfo } } = useContext(UserContext);
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (!userInfo) return notifyError("Connectez-vous pour liker.");
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await BoutiqueServices.toggleLike(post._id);
      setPost((prev) => ({
        ...prev,
        likedByMe: res.liked,
        likesCount: res.likesCount,
      }));
    } catch {
      notifyError("Erreur lors du like.");
    } finally {
      setLikeLoading(false);
    }
  };

  const typeLabel = POST_TYPE_LABELS[post.type];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0">
          {boutique?.logo ? (
            <Image src={boutique.logo} alt={boutique.name} width={40} height={40} className="object-cover" />
          ) : (
            <span className="text-emerald-600 font-bold text-sm">
              {boutique?.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{boutique?.name}</p>
          <p className="text-gray-400 text-xs">{formatDate(post.createdAt)}</p>
        </div>
        {typeLabel && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            {typeLabel}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        <p className="text-gray-700 text-sm whitespace-pre-line">{post.content}</p>
      </div>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-0.5 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.images.slice(0, 4).map((img, i) => (
            <div key={i} className="relative overflow-hidden bg-gray-100"
              style={{ paddingBottom: post.images.length === 1 ? "56.25%" : "100%" }}>
              <img
                src={img}
                alt={`image-${i}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {i === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{post.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            {post.likedByMe ? (
              <IoHeart className="text-red-500 text-xl" />
            ) : (
              <IoHeartOutline className="text-xl" />
            )}
            <span>{post.likesCount || 0}</span>
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-500 transition-colors"
          >
            <IoChatbubbleOutline className="text-xl" />
            <span>{post.commentsCount || 0}</span>
          </button>
        </div>
      </div>

      {/* Section commentaires */}
      {showComments && (
        <div className="border-t border-gray-100">
          <CommentSection postId={post._id} />
        </div>
      )}
    </div>
  );
};

export default PostCard;
