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
          <link rel="icon" href={setting?.favicon || "/sat-and-buy-favicon.png"} />
          <meta
            property="og:title"
            content={
              setting?.meta_title ||
              "Sat & Buy – Marketplace & services énergétiques"
            }
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:description"
            content={
              setting?.meta_description ||
              "Boutique Sat & Buy : solutions solaires, équipements et prestations énergie."
            }
          />
          <meta
            name="keywords"
            content={setting?.meta_keywords || "sat and buy, energie solaire, marketplace cameroun"}
          />
          <meta
            property="og:url"
            content={
              setting?.meta_url || "https://satandbuy.dreamsdigital.cm/"
            }
          />
          <meta
            property="og:image"
            content={
              setting?.meta_img ||
              "https://satandbuy.dreamsdigital.cm/sat-and-buy-favicon.png"
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
