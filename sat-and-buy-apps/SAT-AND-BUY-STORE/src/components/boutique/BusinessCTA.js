import Link from "next/link";
import {
  IoBriefcaseOutline,
  IoMegaphoneOutline,
  IoPeopleOutline,
  IoTrendingUpOutline,
  IoArrowForward,
} from "react-icons/io5";

const PERKS = [
  {
    icon: IoBriefcaseOutline,
    title: "Page entreprise",
    desc: "Créez votre vitrine digitale en quelques minutes",
  },
  {
    icon: IoMegaphoneOutline,
    title: "Publications",
    desc: "Partagez offres, actualités et événements",
  },
  {
    icon: IoPeopleOutline,
    title: "Communauté",
    desc: "Fidélisez vos clients avec des abonnés",
  },
  {
    icon: IoTrendingUpOutline,
    title: "Visibilité",
    desc: "Touchez des milliers d'acheteurs sur la plateforme",
  },
];

const BusinessCTA = () => {
  return (
    <section className="bg-gradient-to-br from-emerald-600 to-teal-700 py-14 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Texte gauche */}
          <div className="flex-1 text-white text-center lg:text-left">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Pour les entreprises
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-snug">
              Votre entreprise mérite<br className="hidden sm:block" /> une présence digitale
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0">
              Rejoignez les entreprises locales sur Diginova — créez votre page, publiez vos offres et développez votre clientèle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/user/ma-boutique"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm shadow-md"
              >
                Créer ma boutique
                <IoArrowForward className="text-base" />
              </Link>
              <Link
                href="/boutiques"
                className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                Voir les boutiques
              </Link>
            </div>
          </div>

          {/* Cards avantages */}
          <div className="flex-1 grid grid-cols-2 gap-3 w-full max-w-sm lg:max-w-none">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white"
              >
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                  <Icon className="text-xl" />
                </div>
                <p className="font-semibold text-sm mb-0.5">{title}</p>
                <p className="text-emerald-100 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
