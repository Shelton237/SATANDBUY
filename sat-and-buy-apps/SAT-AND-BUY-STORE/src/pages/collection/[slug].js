import React, { useState, useMemo, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import Layout from "@layout/Layout";
import CollectionSidebar from "@components/category/CollectionSidebar";
import CollectionProductCard from "@components/product/CollectionProductCard";
import ProductServices from "@services/ProductServices";
import CategoryServices from "@services/CategoryServices";
import AttributeServices from "@services/AttributeServices";
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Link from "next/link";
import { IoChevronForwardOutline } from "react-icons/io5";

const CollectionPage = ({ 
  initialProducts = [], 
  allCategories = [], 
  attributes = [], 
  currentCategory = null 
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();
  const { isLoading, setIsLoading } = useContext(SidebarContext);

  // Filter & Sort State
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    attributes: [],
  });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortedField, setSortedField] = useState("Newest");
  const [visibleItems, setVisibleItems] = useState(20);

  useEffect(() => {
    setIsLoading(false);
  }, [router.asPath]);

  // Derived sub-categories from current category tree
  const subCategories = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.children || [];
  }, [currentCategory]);

  // Filtering Logic (Client Side)
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Sub-categories
    if (selectedFilters.categories.length > 0) {
      result = result.filter(p => 
        selectedFilters.categories.includes(String(p.category)) || 
        p.categories?.some(c => selectedFilters.categories.includes(String(c)))
      );
    }

    // Filter by Attributes
    if (selectedFilters.attributes.length > 0) {
      result = result.filter(p => 
        p.variants?.some(v => 
          Object.values(v).some(val => selectedFilters.attributes.includes(String(val)))
        )
      );
    }

    // Filter by Price
    if (priceRange.min) {
      result = result.filter(p => p.prices?.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(p => p.prices?.price <= Number(priceRange.max));
    }

    // Sorting
    if (sortedField === "Low") {
      result.sort((a, b) => a.prices.price - b.prices.price);
    } else if (sortedField === "High") {
      result.sort((a, b) => b.prices.price - a.prices.price);
    } else if (sortedField === "Top Selling") {
       result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    }

    // Always push out-of-stock to end, preserving existing order within each group
    result = [
      ...result.filter((p) => p.stock > 0),
      ...result.filter((p) => p.stock <= 0),
    ];

    return result;
  }, [initialProducts, selectedFilters, priceRange, sortedField]);

  const handleFilterToggle = (type, id) => {
    if (type === "reset") {
      setSelectedFilters({ categories: [], attributes: [] });
      setPriceRange({ min: "", max: "" });
      return;
    }

    setSelectedFilters(prev => {
      const field = type === "category" ? "categories" : "attributes";
      const isSelected = prev[field].includes(id);
      return {
        ...prev,
        [field]: isSelected 
          ? prev[field].filter(item => item !== id)
          : [...prev[field], id]
      };
    });
  };

  const currentCategoryName = currentCategory 
    ? showingTranslateValue(currentCategory.name)
    : "Collection";

  return (
    <Layout title={currentCategoryName}>
      {/* Hero / Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-8 lg:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <IoChevronForwardOutline className="mx-2" />
            <span className="text-gray-800 tracking-normal">{currentCategoryName}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 tracking-tighter uppercase mb-2">
                {currentCategoryName}
              </h1>
              <p className="text-gray-500 font-sans max-w-2xl leading-relaxed">
                {currentCategory?.description && showingTranslateValue(currentCategory.description)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
               <span className="text-sm font-semibold text-gray-500">{filteredProducts.length} items found</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <CollectionSidebar 
              categories={subCategories}
              attributes={attributes}
              selectedFilters={selectedFilters}
              onFilterToggle={handleFilterToggle}
              priceRange={priceRange}
              onPriceChange={(key, val) => setPriceRange(prev => ({ ...prev, [key]: val }))}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            
            {/* Sorting Top Bar */}
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-50">
               <div className="flex space-x-4">
                 {['Top Selling', 'Newest', 'Low', 'High'].map(field => (
                   <button
                    key={field}
                    onClick={() => setSortedField(field)}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1 rounded-full ${sortedField === field ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}
                   >
                     {field.replace('Low', 'Price: Low').replace('High', 'Price: High')}
                   </button>
                 ))}
               </div>
               
               {/* Mobile Filter Trigger (conceptual) */}
               <button className="lg:hidden text-sm font-bold bg-gray-100 px-4 py-2 rounded-md">
                 Filters
               </button>
            </div>

            {/* Product Gallery */}
            {isLoading ? (
              <Loading loading={isLoading} />
            ) : filteredProducts.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    🔍
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">No products found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
                  <button onClick={() => handleFilterToggle('reset')} className="mt-6 text-emerald-600 font-bold border-b-2 border-emerald-600">
                    Reset Filters
                  </button>
               </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-12">
                {filteredProducts.slice(0, visibleItems).map((product) => (
                  <CollectionProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {filteredProducts.length > visibleItems && (
              <div className="mt-20 flex flex-col items-center border-t border-gray-100 pt-10">
                <span className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">
                  Showing {visibleItems} of {filteredProducts.length} items
                </span>
                <button
                  onClick={() => setVisibleItems(prev => prev + 20)}
                  className="px-12 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all rounded shadow-md active:scale-95"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionPage;

export const getServerSideProps = async (context) => {
  try {
    const { slug } = context.params;
    const { locale } = context;

    console.log(`[SSR] Collection Page Request: slug=${slug}, locale=${locale}`);

    const [allCats, attributes] = await Promise.all([
      CategoryServices.getShowingCategory(),
      AttributeServices.getShowingAttributes(),
    ]);

    console.log(`[SSR] Fetched ${allCats?.length} categories`);

    // Recursive search to find category by slug (Resilient version)
    const findCategory = (cats, targetSlug) => {
      if (!cats || !Array.isArray(cats)) return null;
      for (let cat of cats) {
        // 1. Check explicit slug from DB (high priority)
        if (cat.slug === targetSlug) return cat;

        // 2. Check generated slugs from all translations
        if (cat.name) {
          const nameValues = Object.values(cat.name);
          for (const name of nameValues) {
            if (!name || typeof name !== "string") continue;
            
            // Legacy/Mangled slug: "Fruits et légumes" -> "fruits-et-l-gumes"
            const mangledSlug = name.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
            
            // Cleaned slug: "Fruits et légumes" -> "fruits-et-legumes"
            const cleanedSlug = name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/--+/g, "-")
              .replace(/^-+|-+$/g, "");

            if (mangledSlug === targetSlug || cleanedSlug === targetSlug) return cat;
          }
        }
        
        if (cat.children?.length > 0) {
          const found = findCategory(cat.children, targetSlug);
          if (found) return found;
        }
      }
      return null;
    };

    const currentCat = findCategory(allCats, slug);
    console.log(`[SSR] Category resolution for "${slug}":`, currentCat ? `FOUND (${currentCat.slug || "no-slug-field"})` : "NOT FOUND");

    if (!currentCat) {
      return { notFound: true };
    }

    // Fetch products for this category
    const productsData = await ProductServices.getShowingStoreProducts({
      category: currentCat._id,
      slug: "",
    });

    console.log(`[SSR] Fetched ${productsData?.products?.length || 0} products for category ${currentCat._id}`);

    return {
      props: {
        initialProducts: productsData?.products || [],
        allCategories: allCats,
        currentCategory: currentCat,
        attributes,
      },
    };
  } catch (err) {
    console.error("[SSR] Unexpected error in collection page:", err);
    return {
      props: {
        initialProducts: [],
        allCategories: [],
        currentCategory: null,
        attributes: [],
        error: err.message
      }
    };
  }
};
