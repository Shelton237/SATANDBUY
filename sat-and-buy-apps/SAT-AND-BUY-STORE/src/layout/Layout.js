import Head from "next/head";
import { ToastContainer } from "react-toastify";

//internal import

import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import MobileFooter from "@layout/footer/MobileFooter";
import FeatureCard from "@components/feature-card/FeatureCard";
import StoreChatbot from "@components/chatbot/StoreChatbot";

const Layout = ({ title, description, children }) => {
  return (
    <>
      <ToastContainer />

      <div className="font-sans">
        <Head>
          <title>
            {title
              ? `Diginova Store | ${title}`
              : "Diginova Store – Marketplace & boutiques en ligne"}
          </title>
          {description && <meta name="description" content={description} />}
        </Head>
        <Navbar />
        <div className="bg-gray-50">{children}</div>
        <MobileFooter />
        <div className="w-full">
          <div className="hidden relative lg:block mx-auto max-w-screen-2xl py-6 px-3 sm:px-10">
            <FeatureCard />
          </div>
          <hr className="hr-line"></hr>
          <div className="border-t border-gray-100 w-full">
            <Footer />
          </div>
        </div>
        <StoreChatbot />
      </div>
    </>
  );
};

export default Layout;
