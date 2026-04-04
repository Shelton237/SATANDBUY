import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { UserContext } from "@context/UserContext";
import { IoSend, IoChatbubbleOutline } from "react-icons/io5";
import BoutiqueServices from "@services/BoutiqueServices";
import { notifyError } from "@utils/toast";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const CommentItem = ({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (showReplies) return setShowReplies(false);
    setLoadingReplies(true);
    try {
      const res = await BoutiqueServices.getCommentReplies(comment._id);
      setReplies(res.replies || []);
      setShowReplies(true);
    } catch {
      notifyError("Erreur lors du chargement des réponses.");
    } finally {
      setLoadingReplies(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
        {comment.authorImage ? (
          <Image src={comment.authorImage} alt="" width={32} height={32} className="rounded-full object-cover" />
        ) : (
          (comment.authorName || "?").charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-gray-700">{comment.authorName || "Utilisateur"}</p>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          {comment.repliesCount > 0 && (
            <button
              onClick={loadReplies}
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              {loadingReplies
                ? "Chargement..."
                : showReplies
                ? "Masquer les réponses"
                : `${comment.repliesCount} réponse${comment.repliesCount > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
        {showReplies && replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2">
            {replies.map((r) => (
              <CommentItem key={r._id} comment={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection = ({ postId }) => {
  const { state: { userInfo } } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async (p = 1) => {
    setLoading(true);
    try {
      const res = await BoutiqueServices.getPostComments(postId, { page: p });
      if (p === 1) {
        setComments(res.comments || []);
      } else {
        setComments((prev) => [...prev, ...(res.comments || [])]);
      }
      setTotal(res.total || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!userInfo) return notifyError("Connectez-vous pour commenter.");
    setSubmitting(true);
    try {
      const res = await BoutiqueServices.addComment(postId, { content: text.trim() });
      setComments((prev) => [res.comment, ...prev]);
      setTotal((t) => t + 1);
      setText("");
    } catch {
      notifyError("Erreur lors de l'envoi du commentaire.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Champ de commentaire */}
      {userInfo && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 flex-shrink-0">
            {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 flex items-center border border-gray-200 rounded-full bg-gray-50 px-3 py-1.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="text-emerald-500 disabled:text-gray-300 ml-2"
            >
              <IoSend className="text-lg" />
            </button>
          </div>
        </form>
      )}

      {/* Liste des commentaires */}
      {loading && comments.length === 0 ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <IoChatbubbleOutline />
          <span>Chargement...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm py-2">Aucun commentaire. Soyez le premier !</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} />
          ))}
          {comments.length < total && (
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchComments(next);
              }}
              className="text-sm text-emerald-600 font-medium hover:underline"
            >
              Voir plus de commentaires
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
