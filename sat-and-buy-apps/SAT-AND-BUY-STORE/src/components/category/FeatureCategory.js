import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";

//internal import
import useAsync from "@hooks/useAsync";
import CategoryServices from "@services/CategoryServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const PLACEHOLDER =
  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

const FeatureCategory = () => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

  const { data, error, loading } = useAsync(
    CategoryServices.getShowingCategory
  );

  const handleCategoryClick = (categoryName, categorySlug) => {
    const slug =
      categorySlug ||
      categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
    router.push(`/collection/${slug}`);
    setIsLoading(!isLoading);
  };

  return (
    <>
      {loading ? (
        <CMSkeleton count={10} height={120} error={error} loading={loading} />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {data?.map((category, i) => {
            const imgSrc =
              typeof category?.icon === "string" &&
              (category.icon.startsWith("http") ||
                category.icon.startsWith("/"))
                ? category.icon
                : PLACEHOLDER;

            const name = showingTranslateValue(category?.name);

            return (
              <li key={i + 1} className="group">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCategoryClick(name, category.slug)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCategoryClick(name, category.slug)}
                  className="relative cursor-pointer rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                >
                  {/* Image principale */}
                  <div className="relative w-full h-36 sm:h-40 md:h-44">
                    <Image
                      src={imgSrc}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                    {/* Nom de la catégorie */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6">
                      <h3 className="text-white text-sm font-semibold font-serif leading-tight line-clamp-2 drop-shadow">
                        {name}
                      </h3>
                    </div>
                  </div>

                  {/* Sous-catégories */}
                  {category?.children?.length > 0 && (
                    <div className="bg-white px-2.5 py-2 flex flex-wrap gap-1">
                      {category.children.slice(0, 3).map((child) => {
                        const childName = showingTranslateValue(child?.name);
                        return (
                          <button
                            key={child._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(childName, child.slug);
                            }}
                            className="text-xs text-gray-500 bg-gray-100 hover:bg-blue-50 hover:text-brand-blue rounded-full px-2 py-0.5 transition-colors font-serif truncate max-w-full"
                          >
                            {childName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default FeatureCategory;
