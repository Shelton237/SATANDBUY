import SettingServices from "@services/SettingServices";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // Fetch general metadata from backend API
    let setting = null;
    try {
      setting = await SettingServices.getStoreSeoSetting();
    } catch (err) {
      console.error("Failed to load SEO settings:", err?.message || err);
    }

    return { ...initialProps, setting };
  }

  render() {
    const setting = this.props.setting;
    return (
      <Html lang="fr">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&family=Open+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
          <link rel="icon" href={setting?.favicon || "/favicon.png"} />
          <meta
            property="og:title"
            content={
              setting?.meta_title ||
              "Diginova Store – Marketplace & boutiques en ligne"
            }
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:description"
            content={
              setting?.meta_description ||
              "Diginova Store : découvrez des milliers de produits et boutiques locales. Commandez facilement en ligne."
            }
          />
          <meta
            name="keywords"
            content={setting?.meta_keywords || "diginova store, marketplace, boutiques en ligne, cameroun, e-commerce"}
          />
          <meta
            property="og:url"
            content={
              setting?.meta_url || "https://store.diginova.cm/"
            }
          />
          <meta
            property="og:image"
            content={
              setting?.meta_img ||
              "https://store.diginova.cm/logo/logo-color.png"
            }
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
