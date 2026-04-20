import { SidebarContext } from "@context/SidebarContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoBriefcaseOutline, IoSearchOutline } from "react-icons/io5";

//internal import
import Layout from "@layout/Layout";
import Banner from "@components/banner/Banner";
import useGetSetting from "@hooks/useGetSetting";
import CardTwo from "@components/cta-card/CardTwo";
import OfferCard from "@components/offer/OfferCard";
import StickyCart from "@components/cart/StickyCart";
import Loading from "@components/preloader/Loading";
import ProductServices from "@services/ProductServices";
import BoutiqueServices from "@services/BoutiqueServices";
import ProductCard from "@components/product/ProductCard";
import MainCarousel from "@components/carousel/MainCarousel";
import FeatureCategory from "@components/category/FeatureCategory";
import AttributeServices from "@services/AttributeServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import BusinessCTA from "@components/boutique/BusinessCTA";
import FeaturedItemsSection from "@components/boutique/FeaturedItemsSection";

const Home = ({ popularProducts, discountProducts, services, attributes, featuredItems }) => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { loading, error, storeCustomizationSetting } = useGetSetting();
  const [searchQuery, setSearchQuery] = useState("");

  // console.log("storeCustomizationSetting", storeCustomizationSetting);

  useEffect(() => {
    if (router.asPath === "/") {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout>
          <div>
            <StickyCart />
            <div className="bg-white">
              {/* Hero — full width */}
              <div className="mx-auto py-5 max-w-screen-2xl px-3 sm:px-10">
                <MainCarousel />
                {/* Barre de recherche hero */}
                <div className="mt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className="flex items-center bg-white border-2 border-brand-blue rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto"
                  >
                    <IoSearchOutline className="ml-4 text-brand-blue text-xl flex-shrink-0" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un produit, service, boutique…"
                      className="flex-1 px-3 py-3 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                      aria-label="Rechercher"
                    />
                    <button
                      type="submit"
                      className="bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm px-6 py-3 transition-colors flex-shrink-0"
                    >
                      Chercher
                    </button>
                  </form>
                </div>
              </div>

              {/* Coupon strip — below hero, compact */}
              <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 pb-5">
                <OfferCard />
              </div>

              {storeCustomizationSetting?.home?.promotion_banner_status && (
                <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 pb-5">
                  <div className="bg-orange-100 px-10 py-6 rounded-lg">
                    <Banner />
                  </div>
                </div>
              )}
            </div>

            {/* feature category's */}
            {storeCustomizationSetting?.home?.featured_status && (
              <div className="bg-gray-100 lg:py-16 py-10">
                <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
                  <div className="mb-10 flex justify-center">
                    <div className="text-center w-full lg:w-2/5">
                      <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold">
                        <CMSkeleton
                          count={1}
                          height={30}
                          // error={error}
                          loading={loading}
                          data={storeCustomizationSetting?.home?.feature_title}
                        />
                      </h2>
                      <p className="text-base font-sans text-gray-600 leading-6">
                        <CMSkeleton
                          count={4}
                          height={10}
                          error={error}
                          loading={loading}
                          data={
                            storeCustomizationSetting?.home?.feature_description
                          }
                        />
                      </p>
                    </div>
                  </div>

                  <FeatureCategory />
                </div>
              </div>
            )}

            {/* popular products */}
            {storeCustomizationSetting?.home?.popular_products_status && (
              <div className="bg-gray-50 lg:py-16 py-10 mx-auto max-w-screen-2xl px-3 sm:px-10">
                <div className="mb-10 flex justify-center">
                  <div className="text-center w-full lg:w-2/5">
                    <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold">
                      <CMSkeleton
                        count={1}
                        height={30}
                        // error={error}
                        loading={loading}
                        data={storeCustomizationSetting?.home?.popular_title}
                      />
                    </h2>
                    <p className="text-base font-sans text-gray-600 leading-6">
                      <CMSkeleton
                        count={5}
                        height={10}
                        error={error}
                        loading={loading}
                        data={
                          storeCustomizationSetting?.home?.popular_description
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-full">
                    {loading ? (
                      <CMSkeleton
                        count={20}
                        height={20}
                        error={error}
                        loading={loading}
                      />
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
                        {popularProducts
                          ?.slice(
                            0,
                            storeCustomizationSetting?.home
                              ?.popular_product_limit
                          )
                          .map((product) => (
                            <ProductCard
                              key={product._id}
                              product={product}
                              attributes={attributes}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* services section */}
            {services?.length > 0 && (
              <div className="bg-blue-50 lg:py-16 py-10">
                <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
                  <div className="mb-10 flex justify-center">
                    <div className="text-center w-full lg:w-2/5">
                      <span className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-blue-100 text-brand-blue text-sm font-semibold">
                        <IoBriefcaseOutline size={15} />
                        Nos Services
                      </span>
                      <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold text-gray-800">
                        Des prestations professionnelles
                      </h2>
                      <p className="text-base font-sans text-gray-500 leading-6">
                        Réservez nos services disponibles à domicile, en ligne ou sur site.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                    {services.map((service) => (
                      <ProductCard
                        key={service._id}
                        product={service}
                        attributes={attributes}
                      />
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <a
                      href="/services"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-brand-blue text-brand-blue font-semibold text-sm hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"
                    >
                      Voir tous les services
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Produits & Services en vedette — boutiques partenaires */}
            <FeaturedItemsSection initialItems={featuredItems} />

            {/* CTA Business / Boutique */}
            <BusinessCTA />

            {/* promotional banner card */}
            {storeCustomizationSetting?.home?.delivery_status && (
              <div className="block mx-auto max-w-screen-2xl">
                <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
                  <div className="lg:p-16 p-6 bg-brand-coral shadow-sm border rounded-lg">
                    <CardTwo />
                  </div>
                </div>
              </div>
            )}

            {/* discounted products */}
            {storeCustomizationSetting?.home?.discount_product_status &&
              discountProducts?.length > 0 && (
                <div
                  id="discount"
                  className="bg-white lg:py-16 py-10 mx-auto max-w-screen-2xl px-3 sm:px-10"
                >
                  <div className="mb-10 flex justify-center">
                    <div className="text-center w-full lg:w-2/5">
                      <h2 className="text-xl lg:text-2xl mb-2 font-serif font-semibold">
                        <CMSkeleton
                          count={1}
                          height={30}
                          // error={error}
                          loading={loading}
                          data={
                            storeCustomizationSetting?.home
                              ?.latest_discount_title
                          }
                        />
                      </h2>
                      <p className="text-base font-sans text-gray-600 leading-6">
                        <CMSkeleton
                          count={5}
                          height={20}
                          // error={error}
                          loading={loading}
                          data={
                            storeCustomizationSetting?.home
                              ?.latest_discount_description
                          }
                        />
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-full">
                      {loading ? (
                        <CMSkeleton
                          count={20}
                          height={20}
                          error={error}
                          loading={loading}
                        />
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 lg:gap-3">
                          {discountProducts
                            ?.slice(
                              0,
                              storeCustomizationSetting?.home
                                ?.latest_discount_product_limit
                            )
                            .map((product) => (
                              <ProductCard
                                key={product._id}
                                product={product}
                                attributes={attributes}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </Layout>
      )}
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { cookies } = context.req;
  const { query, _id } = context.query;

  try {
    console.log("[SSR] Fetching data for Home page...");
    const [data, servicesData, attributes, featuredData] = await Promise.all([
      ProductServices.getShowingStoreProducts({
        category: _id ? _id : "",
        title: query ? query : "",
      }),
      ProductServices.getShowingStoreServices().catch(() => ({ products: [] })),
      AttributeServices.getShowingAttributes(),
      BoutiqueServices.getFeaturedCatalogItems({ page: 1, limit: 6 }).catch(() => ({ items: [] })),
    ]);
    console.log("[SSR] Data fetched successfully:", {
      productCount: data?.popularProducts?.length,
      serviceCount: servicesData?.products?.length,
      attributeCount: attributes?.length,
    });

    const sortByStock = (arr) => [
      ...(arr || []).filter((p) => p.stock > 0),
      ...(arr || []).filter((p) => p.stock <= 0),
    ];

    return {
      props: {
        popularProducts: sortByStock(data.popularProducts),
        discountProducts: sortByStock(data.discountedProducts),
        services: servicesData?.products || [],
        cookies: cookies || null,
        attributes: attributes || [],
        featuredItems: featuredData?.items || [],
      },
    };
  } catch (error) {
    console.error("[SSR] Error in getServerSideProps:", error);
    return {
      props: {
        popularProducts: [],
        discountProducts: [],
        services: [],
        cookies: cookies || null,
        attributes: [],
        featuredItems: [],
        ssrError: error.message
      },
    };
  }
};

export default Home;
