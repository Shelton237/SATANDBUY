import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MainCarousel = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, showingUrl, showingImage } = useUtilsFunction();

  const sliderData = [
    {
      id: 1,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.first_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.first_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.first_button),
      url: showingUrl(storeCustomizationSetting?.slider?.first_link),
      image: showingImage(storeCustomizationSetting?.slider?.first_img) || "/slider/slider-1.jpg",
    },
    {
      id: 2,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.second_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.second_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.second_button),
      url: showingUrl(storeCustomizationSetting?.slider?.second_link),
      image: showingImage(storeCustomizationSetting?.slider?.second_img) || "/slider/slider-2.jpg",
    },
    {
      id: 3,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.third_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.third_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.third_button),
      url: showingUrl(storeCustomizationSetting?.slider?.third_link),
      image: showingImage(storeCustomizationSetting?.slider?.third_img) || "/slider/slider-3.jpg",
    },
    {
      id: 4,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.four_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.four_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.four_button),
      url: showingUrl(storeCustomizationSetting?.slider?.four_link),
      image: showingImage(storeCustomizationSetting?.slider?.four_img) || "/slider/slider-1.jpg",
    },
    {
      id: 5,
      title: showingTranslateValue(storeCustomizationSetting?.slider?.five_title),
      info: showingTranslateValue(storeCustomizationSetting?.slider?.five_description),
      buttonName: showingTranslateValue(storeCustomizationSetting?.slider?.five_button),
      url: showingUrl(storeCustomizationSetting?.slider?.five_link),
      image: showingImage(storeCustomizationSetting?.slider?.five_img) || "/slider/slider-2.jpg",
    },
  ];

  // Only show slides that have an image
  const validSlides = sliderData.filter((s) => s.image);

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-md">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="hero-swiper"
      >
        {validSlides.map((item) => (
          <SwiperSlide key={item.id}>
            {/* Fixed-height container — full width */}
            <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-[420px]">
              <Image
                src={item.image}
                alt={item.title || "Slide"}
                fill
                sizes="100vw"
                className="object-cover"
                priority={item.id === 1}
              />
              {/* Dark gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

              {/* Text content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16">
                <div className="max-w-xl">
                  {item.title && (
                    <h1 className="text-white font-serif font-bold text-xl sm:text-2xl lg:text-4xl leading-tight mb-3 drop-shadow-md">
                      {item.title}
                    </h1>
                  )}
                  {item.info && (
                    <p className="text-white/85 font-sans text-sm sm:text-base lg:text-lg leading-relaxed mb-6 line-clamp-2 drop-shadow">
                      {item.info}
                    </p>
                  )}
                  {item.buttonName && item.url && (
                    <Link
                      href={item.url}
                      className="inline-block text-sm font-serif font-semibold px-6 py-2.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                      {item.buttonName}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.35);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
        }
        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 14px;
          font-weight: 700;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.6);
        }
        .hero-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.55;
          width: 8px;
          height: 8px;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #10b981;
          opacity: 1;
          width: 22px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default MainCarousel;
