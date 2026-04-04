import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserContext } from "@context/UserContext";
import {
  IoBriefcaseOutline, IoCheckmarkCircle, IoPeopleOutline,
  IoCallOutline, IoMailOutline, IoLocationOutline, IoGlobeOutline,
  IoLogoFacebook, IoLogoInstagram, IoAdd, IoPencil,
} from "react-icons/io5";
import Layout from "@layout/Layout";
import PostCard from "@components/boutique/PostCard";
import CreatePostModal from "@components/boutique/CreatePostModal";
import CatalogSection from "@components/boutique/CatalogSection";
import Loading from "@components/preloader/Loading";
import BoutiqueServices from "@services/BoutiqueServices";
import { notifyError, notifySuccess } from "@utils/toast";

const BUSINESS_TYPE_LABELS = {
  medical: "Consultation Médicale",
  it_services: "Services Informatiques",
  internet: "Vente de Connexion Internet",
  clothing: "Vêtements & Chaussures",
  food_beverages: "Jus Naturels & Alimentation",
  naturopathy: "Naturopathie",
  education: "Éducation",
  beauty: "Beauté & Bien-être",
  real_estate: "Immobilier",
  transport: "Transport",
  other: "Boutique",
};

const BoutiquePage = ({ slug }) => {
  const { state: { userInfo } } = useContext(UserContext);
  const [boutique, setBoutique] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPage, setPostsPage] = useState(1);
  const [loadingBoutique, setLoadingBoutique] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState("publications");

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoadingBoutique(true);
      try {
        const res = await BoutiqueServices.getBoutiqueBySlug(slug);
        setBoutique(res.boutique);
        setIsFollowing(res.isFollowing || false);

        // Vérifier si c'est le propriétaire
        if (userInfo) {
          try {
            const myBoutique = await BoutiqueServices.getMyBoutique();
            if (myBoutique?.boutique?._id === res.boutique._id) {
              setIsOwner(true);
            }
          } catch {
            // pas de boutique
          }
        }

        // Charger les posts
        setLoadingPosts(true);
        const postsRes = await BoutiqueServices.getBoutiquePosts(res.boutique._id, { page: 1 });
        setPosts(postsRes.posts || []);
        setTotalPosts(postsRes.total || 0);
        setPostsPage(1);
      } catch {
        // Boutique introuvable
      } finally {
        setLoadingBoutique(false);
        setLoadingPosts(false);
      }
    };
    load();
  }, [slug, userInfo]);

  const loadMorePosts = async () => {
    const next = postsPage + 1;
    setLoadingPosts(true);
    try {
      const res = await BoutiqueServices.getBoutiquePosts(boutique._id, { page: next });
      setPosts((prev) => [...prev, ...(res.posts || [])]);
      setPostsPage(next);
    } catch {
      notifyError("Erreur lors du chargement.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleFollow = async () => {
    if (!userInfo) return notifyError("Connectez-vous pour suivre cette boutique.");
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await BoutiqueServices.toggleFollow(boutique._id);
      setIsFollowing(res.following);
      setBoutique((prev) => ({ ...prev, followersCount: res.followersCount }));
      notifySuccess(res.following ? "Boutique suivie !" : "Abonnement annulé.");
    } catch {
      notifyError("Erreur lors de l'action.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setTotalPosts((t) => t + 1);
  };

  if (loadingBoutique) return <Layout><Loading loading={true} /></Layout>;
  if (!boutique) return (
    <Layout title="Boutique introuvable">
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <IoBriefcaseOutline className="text-5xl mb-3" />
        <p className="text-lg font-medium">Boutique introuvable</p>
        <Link href="/boutiques" className="text-sm text-emerald-500 mt-2 hover:underline">
          Voir toutes les boutiques
        </Link>
      </div>
    </Layout>
  );

  const typeLabel = BUSINESS_TYPE_LABELS[boutique.businessType] || "Boutique";

  return (
    <Layout title={boutique.name}>
      {showCreatePost && (
        <CreatePostModal
          boutique={boutique}
          onClose={() => setShowCreatePost(false)}
          onCreated={handlePostCreated}
        />
      )}

      {/* Cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-emerald-400 to-teal-500 w-full">
        {boutique.coverImage && (
          <Image src={boutique.coverImage} alt={boutique.name} fill className="object-cover" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profil */}
        <div className="relative -mt-10 mb-4 flex items-end justify-between">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
            {boutique.logo ? (
              <Image src={boutique.logo} alt={boutique.name} width={80} height={80} className="object-cover" />
            ) : (
              <IoBriefcaseOutline className="text-emerald-500 text-3xl" />
            )}
          </div>
          <div className="flex gap-2 pb-1">
            {isOwner ? (
              <>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <IoAdd className="text-lg" />
                  Publier
                </button>
                <Link
                  href="/user/ma-boutique"
                  className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <IoPencil className="text-base" />
                  Gérer
                </Link>
              </>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isFollowing
                    ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {followLoading ? "..." : isFollowing ? "Abonné" : "+ Suivre"}
              </button>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-800">{boutique.name}</h1>
            {boutique.verified && <IoCheckmarkCircle className="text-emerald-500 text-xl" />}
          </div>
          <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full">{typeLabel}</span>

          {boutique.description && (
            <p className="text-gray-600 text-sm mt-3">{boutique.description}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <IoPeopleOutline />
              {boutique.followersCount} abonné{boutique.followersCount !== 1 ? "s" : ""}
            </span>
            {boutique.city && (
              <span className="flex items-center gap-1">
                <IoLocationOutline />
                {boutique.city}{boutique.country ? `, ${boutique.country}` : ""}
              </span>
            )}
            {boutique.phone && (
              <a href={`tel:${boutique.phone}`} className="flex items-center gap-1 hover:text-emerald-500">
                <IoCallOutline />
                {boutique.phone}
              </a>
            )}
            {boutique.email && (
              <a href={`mailto:${boutique.email}`} className="flex items-center gap-1 hover:text-emerald-500">
                <IoMailOutline />
                {boutique.email}
              </a>
            )}
            {boutique.website && (
              <a href={boutique.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-500">
                <IoGlobeOutline />
                Site web
              </a>
            )}
          </div>

          {/* Réseaux sociaux */}
          {(boutique.socialLinks?.facebook || boutique.socialLinks?.instagram) && (
            <div className="flex gap-3 mt-3">
              {boutique.socialLinks?.facebook && (
                <a href={boutique.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                  <IoLogoFacebook className="text-2xl" />
                </a>
              )}
              {boutique.socialLinks?.instagram && (
                <a href={boutique.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-600">
                  <IoLogoInstagram className="text-2xl" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: "publications", label: "Publications", count: totalPosts },
            { key: "catalogue", label: "Catalogue", count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Publications */}
        {activeTab === "publications" && (
          <div className="pb-10">
            {isOwner && posts.length === 0 && !loadingPosts && (
              <div className="bg-emerald-50 border border-dashed border-emerald-300 rounded-xl p-6 text-center mb-4">
                <p className="text-emerald-700 text-sm font-medium">Partagez votre première publication !</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                >
                  Créer un post
                </button>
              </div>
            )}

            {loadingPosts && posts.length === 0 ? (
              <Loading loading={true} />
            ) : posts.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">Aucune publication pour l'instant.</p>
            ) : (
              <div className="space-y-4">
                {posts.map((p) => (
                  <PostCard key={p._id} post={p} boutique={boutique} />
                ))}
                {posts.length < totalPosts && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={loadMorePosts}
                      disabled={loadingPosts}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl text-sm transition-colors"
                    >
                      {loadingPosts ? "Chargement..." : "Voir plus"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Catalogue */}
        {activeTab === "catalogue" && (
          <CatalogSection boutique={boutique} isOwner={isOwner} />
        )}
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return { props: { slug: params.slug } };
}

export default BoutiquePage;
