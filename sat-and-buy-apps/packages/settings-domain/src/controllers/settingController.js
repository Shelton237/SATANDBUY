//models
const Setting = require("../models/Setting");

const cloneDefaults = (defaults = {}) =>
  JSON.parse(JSON.stringify(defaults || {}));

const DEFAULT_GLOBAL_SETTING = {
  shop_name: "",
  company_name: "",
  address: "",
  vat_number: "",
  post_code: "",
  contact: "",
  email: "",
  website: "",
  receipt_size: "",
  default_currency: "FCFA",
  default_time_zone: "Africa/Douala",
  default_date_format: "DD/MM/YYYY",
  number_of_image_per_product: 5,
  floating_number: 2,
};

const DEFAULT_STORE_SETTING = {};

const DEFAULT_STORE_CUSTOMIZATION_SETTING = {
  navbar: {},
  home: {},
  checkout: {},
  slider: {},
  seo: {},
};

const ensureSettingDocument = async (name, defaults = {}) => {
  let doc = await Setting.findOne({ name });
  if (!doc) {
    doc = new Setting({
      name,
      setting: cloneDefaults(defaults),
    });
    await doc.save();
  } else if (!doc.setting) {
    doc.setting = cloneDefaults(defaults);
    await doc.save();
  }
  return doc;
};

//global setting controller
const addGlobalSetting = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      name: "globalSetting",
    };

    await Setting.findOneAndUpdate(
      { name: "globalSetting" },
      { $set: { setting: payload.setting || req.body.setting || req.body } },
      { upsert: true }
    );
    res.send({
      message: "Global Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getGlobalSetting = async (req, res) => {
  try {
    const globalSetting = await ensureSettingDocument(
      "globalSetting",
      DEFAULT_GLOBAL_SETTING
    );
    res.send(globalSetting.setting || DEFAULT_GLOBAL_SETTING);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateGlobalSetting = async (req, res) => {
  try {
    const bodySetting = req.body.setting || req.body;
    const globalSetting = await Setting.findOneAndUpdate(
      {
        name: "globalSetting",
      },
      {
        $set: {
          "setting.number_of_image_per_product":
            bodySetting.number_of_image_per_product,
          "setting.shop_name": bodySetting.shop_name,
          "setting.company_name": bodySetting.company_name,
          "setting.address": bodySetting.address,
          "setting.vat_number": bodySetting.vat_number,
          "setting.post_code": bodySetting.post_code,
          "setting.contact": bodySetting.contact,
          "setting.email": bodySetting.email,
          "setting.website": bodySetting.website,
          "setting.receipt_size": bodySetting.receipt_size,
          "setting.default_currency":
            bodySetting.default_currency || DEFAULT_GLOBAL_SETTING.default_currency,
          "setting.default_time_zone":
            bodySetting.default_time_zone || DEFAULT_GLOBAL_SETTING.default_time_zone,
          "setting.default_date_format":
            bodySetting.default_date_format || DEFAULT_GLOBAL_SETTING.default_date_format,

          //for store setting
          "setting.cod_status": bodySetting.cod_status,
          "setting.stripe_status": bodySetting.stripe_status,
          "setting.fb_pixel_status": bodySetting.fb_pixel_status,
          "setting.google_login_status": bodySetting.google_login_status,
          "setting.google_analytic_status":
            bodySetting.google_analytic_status,
          "setting.stripe_key": bodySetting.stripe_key,
          "setting.stripe_secret": bodySetting.stripe_secret,
          "setting.google_client_id": bodySetting.google_client_id,
          "setting.google_secret_key": bodySetting.google_secret_key,
          "setting.google_analytic_key": bodySetting.google_analytic_key,
          "setting.fb_pixel_key": bodySetting.fb_pixel_key,
          "setting.tawk_chat_status": bodySetting.tawk_chat_status,
          "setting.tawk_chat_property_id":
            bodySetting.tawk_chat_property_id,
          "setting.tawk_chat_widget_id": bodySetting.tawk_chat_widget_id,
          // //for seo
          "setting.meta_img": bodySetting.meta_img,
          "setting.favicon": bodySetting.favicon,
          "setting.meta_title": bodySetting.meta_title,
          "setting.meta_description": bodySetting.meta_description,
          "setting.meta_keywords": bodySetting.meta_keywords,
          "setting.meta_url": bodySetting.meta_url,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.send({
      data: globalSetting,
      message: "Global Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//store setting controller
const addStoreSetting = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      name: "storeSetting",
    };
    await Setting.findOneAndUpdate(
      { name: "storeSetting" },
      { $set: { setting: payload.setting || req.body.setting || req.body } },
      { upsert: true }
    );
    res.send({
      message: "Store Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getStoreSetting = async (req, res) => {
  try {
    const storeSetting = await ensureSettingDocument(
      "storeSetting",
      DEFAULT_STORE_SETTING
    );

    res.send(storeSetting.setting || DEFAULT_STORE_SETTING);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStoreSetting = async (req, res) => {
  try {
    const bodySetting = req.body.setting || req.body;
    const storeSetting = await Setting.findOneAndUpdate(
      {
        name: "storeSetting",
      },
      {
        $set: {
          //for store setting
          "setting.cod_status": bodySetting.cod_status,
          "setting.stripe_status": bodySetting.stripe_status,
          "setting.razorpay_status": bodySetting.razorpay_status,
          "setting.fb_pixel_status": bodySetting.fb_pixel_status,
          "setting.google_login_status": bodySetting.google_login_status,
          "setting.github_login_status": bodySetting.github_login_status,
          "setting.facebook_login_status":
            bodySetting.facebook_login_status,
          "setting.google_analytic_status":
            bodySetting.google_analytic_status,
          "setting.stripe_key": bodySetting.stripe_key,
          "setting.stripe_secret": bodySetting.stripe_secret,
          "setting.razorpay_id": bodySetting.razorpay_id,
          "setting.razorpay_secret": bodySetting.razorpay_secret,
          "setting.google_id": bodySetting.google_id,
          "setting.google_secret": bodySetting.google_secret,
          "setting.github_id": bodySetting.github_id,
          "setting.github_secret": bodySetting.github_secret,
          "setting.facebook_id": bodySetting.facebook_id,
          "setting.facebook_secret": bodySetting.facebook_secret,
          "setting.nextauth_secret": bodySetting.nextauth_secret,
          "setting.next_api_base_url": bodySetting.next_api_base_url,

          "setting.google_analytic_key": bodySetting.google_analytic_key,
          "setting.fb_pixel_key": bodySetting.fb_pixel_key,
          "setting.tawk_chat_status": bodySetting.tawk_chat_status,
          "setting.tawk_chat_property_id":
            bodySetting.tawk_chat_property_id,
          "setting.tawk_chat_widget_id": bodySetting.tawk_chat_widget_id,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.send({
      data: storeSetting,
      message: "Store Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//online store customization controller
const addStoreCustomizationSetting = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      name: "storeCustomizationSetting",
    };
    const storeCustomizationSetting = await Setting.findOneAndUpdate(
      { name: "storeCustomizationSetting" },
      { $set: { setting: payload.setting || req.body.setting || req.body } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.send({
      data: storeCustomizationSetting,
      message: "Online Store Customization Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getStoreCustomizationSetting = async (req, res) => {
  try {
    const { key, keyTwo } = req.query;

    const storeCustomizationSetting = await ensureSettingDocument(
      "storeCustomizationSetting",
      DEFAULT_STORE_CUSTOMIZATION_SETTING
    );

    if (!storeCustomizationSetting) {
      return res.status(404).send({ message: "Settings not found" });
    }

    const selection = storeCustomizationSetting.setting || DEFAULT_STORE_CUSTOMIZATION_SETTING;

    if (key || keyTwo) {
      const partial = {};
      if (key && selection[key] !== undefined) {
        partial[key] = selection[key];
      }
      if (keyTwo && selection[keyTwo] !== undefined) {
        partial[keyTwo] = selection[keyTwo];
      }
      return res.send(partial);
    }

    res.send(selection);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getStoreSeoSetting = async (req, res) => {
  // console.log("getStoreSeoSetting");
  try {
    const storeCustomizationSetting = await ensureSettingDocument(
      "storeCustomizationSetting",
      DEFAULT_STORE_CUSTOMIZATION_SETTING
    );
    res.send(storeCustomizationSetting?.setting);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStoreCustomizationSetting = async (req, res) => {
  try {
    const setting = req.body.setting || req.body;
    // console.log("updateStoreCustomizationSetting");

    const storeCustomizationSetting = await Setting.findOneAndUpdate(
      {
        name: "storeCustomizationSetting",
      },
      {
        $set: {
          // navbar
          "setting.navbar.help_text": setting.navbar.help_text,
          "setting.navbar.categories": setting.navbar.categories,
          "setting.navbar.about_us": setting.navbar.about_us,
          "setting.navbar.contact_us": setting.navbar.contact_us,
          "setting.navbar.offers": setting.navbar.offers,
          "setting.navbar.faq": setting.navbar.faq,
          "setting.navbar.privacy_policy": setting.navbar.privacy_policy,
          "setting.navbar.term_and_condition":
            setting.navbar.term_and_condition,
          "setting.navbar.pages": setting.navbar.pages,
          "setting.navbar.my_account": setting.navbar.my_account,
          "setting.navbar.login": setting.navbar.login,
          "setting.navbar.logout": setting.navbar.logout,
          "setting.navbar.checkout": setting.navbar.checkout,
          "setting.navbar.phone": setting.navbar.phone,
          "setting.navbar.logo": setting.navbar.logo,
          "setting.navbar.term_and_condition_status":
            setting.navbar.term_and_condition_status,
          "setting.navbar.privacy_policy_status":
            setting.navbar.privacy_policy_status,
          "setting.navbar.faq_status": setting.navbar.faq_status,
          "setting.navbar.categories_menu_status":
            setting.navbar.categories_menu_status,
          "setting.navbar.about_menu_status": setting.navbar.about_menu_status,
          "setting.navbar.contact_menu_status":
            setting.navbar.contact_menu_status,
          "setting.navbar.offers_menu_status":
            setting.navbar.offers_menu_status,

          // home
          "setting.home.coupon_status": setting.home.coupon_status,
          "setting.home.featured_status": setting.home.featured_status,

          "setting.home.daily_needs_status": setting.home.daily_needs_status,

          "setting.home.feature_promo_status":
            setting.home.feature_promo_status,

          "setting.home.slider_width_status": setting.home.slider_width_status,
          "setting.home.promotion_banner_status":
            setting.home.promotion_banner_status,
          "setting.home.delivery_status": setting.home.delivery_status,
          "setting.home.popular_products_status":
            setting.home.popular_products_status,
          "setting.home.discount_product_status":
            setting.home.discount_product_status,
          "setting.home.discount_coupon_code":
            setting.home.discount_coupon_code,
          "setting.home.place_holder_img": setting.home.place_holder_img,

          "setting.home.discount_title": setting.home.discount_title,
          "setting.home.promotion_title": setting.home.promotion_title,
          "setting.home.promotion_description":
            setting.home.promotion_description,
          "setting.home.promotion_button_name":
            setting.home.promotion_button_name,
          "setting.home.promotion_button_link":
            setting.home.promotion_button_link,
          "setting.home.feature_title": setting.home.feature_title,
          "setting.home.feature_description": setting.home.feature_description,
          "setting.home.feature_product_limit":
            setting.home.feature_product_limit,
          "setting.home.popular_title": setting.home.popular_title,
          "setting.home.popular_description": setting.home.popular_description,
          "setting.home.popular_product_limit":
            setting.home.popular_product_limit,
          "setting.home.quick_delivery_subtitle":
            setting.home.quick_delivery_subtitle,
          "setting.home.quick_delivery_title":
            setting.home.quick_delivery_title,
          "setting.home.quick_delivery_description":
            setting.home.quick_delivery_description,
          "setting.home.quick_delivery_button":
            setting.home.quick_delivery_button,
          "setting.home.quick_delivery_link": setting.home.quick_delivery_link,
          "setting.home.quick_delivery_img": setting.home.quick_delivery_img,
          "setting.home.latest_discount_title":
            setting.home.latest_discount_title,
          "setting.home.latest_discount_description":
            setting.home.latest_discount_description,
          "setting.home.latest_discount_product_limit":
            setting.home.latest_discount_product_limit,
          "setting.home.daily_need_title": setting.home.daily_need_title,
          "setting.home.daily_need_description":
            setting.home.daily_need_description,
          "setting.home.daily_need_app_link": setting.home.daily_need_app_link,
          "setting.home.daily_need_google_link":
            setting.home.daily_need_google_link,
          "setting.home.daily_need_img_left": setting.home.daily_need_img_left,
          "setting.home.daily_need_img_right":
            setting.home.daily_need_img_right,
          "setting.home.button1_img": setting.home.button1_img,
          "setting.home.button2_img": setting.home.button2_img,

          //slider
          "setting.slider.left_right_arrow": setting.slider.left_right_arrow,
          "setting.slider.bottom_dots": setting.slider.bottom_dots,
          "setting.slider.both_slider": setting.slider.both_slider,
          "setting.slider.first_img": setting.slider.first_img,
          "setting.slider.first_title": setting.slider.first_title,
          "setting.slider.first_description": setting.slider.first_description,
          "setting.slider.first_button": setting.slider.first_button,
          "setting.slider.first_link": setting.slider.first_link,
          "setting.slider.second_img": setting.slider.second_img,
          "setting.slider.second_title": setting.slider.second_title,
          "setting.slider.second_description":
            setting.slider.second_description,
          "setting.slider.second_button": setting.slider.second_button,
          "setting.slider.second_link": setting.slider.second_link,
          "setting.slider.third_img": setting.slider.third_img,
          "setting.slider.third_title": setting.slider.third_title,
          "setting.slider.third_description": setting.slider.third_description,
          "setting.slider.third_button": setting.slider.third_button,
          "setting.slider.third_link": setting.slider.third_link,
          "setting.slider.four_img": setting.slider.four_img,
          "setting.slider.four_title": setting.slider.four_title,
          "setting.slider.four_description": setting.slider.four_description,
          "setting.slider.four_button": setting.slider.four_button,
          "setting.slider.four_link": setting.slider.four_link,
          "setting.slider.five_img": setting.slider.five_img,
          "setting.slider.five_title": setting.slider.five_title,
          "setting.slider.five_description": setting.slider.five_description,
          "setting.slider.five_button": setting.slider.five_button,
          "setting.slider.five_link": setting.slider.five_link,

          //checkout
          "setting.checkout.personal_details":
            setting.checkout.personal_details,
          "setting.checkout.first_name": setting.checkout.first_name,
          "setting.checkout.last_name": setting.checkout.last_name,
          "setting.checkout.email_address": setting.checkout.email_address,
          "setting.checkout.checkout_phone": setting.checkout.checkout_phone,

          "setting.checkout.shipping_details":
            setting.checkout.shipping_details,
          "setting.checkout.street_address": setting.checkout.street_address,
          "setting.checkout.city": setting.checkout.city,
          "setting.checkout.country": setting.checkout.country,
          "setting.checkout.zip_code": setting.checkout.zip_code,
          "setting.checkout.shipping_cost": setting.checkout.shipping_cost,
          "setting.checkout.shipping_name_one":
            setting.checkout.shipping_name_one,
          "setting.checkout.shipping_one_desc":
            setting.checkout.shipping_one_desc,
          "setting.checkout.shipping_one_cost":
            setting.checkout.shipping_one_cost,
          "setting.checkout.shipping_name_two":
            setting.checkout.shipping_name_two,
          "setting.checkout.shipping_two_desc":
            setting.checkout.shipping_two_desc,
          "setting.checkout.shipping_two_cost":
            setting.checkout.shipping_two_cost,
          "setting.checkout.payment_method": setting.checkout.payment_method,
          "setting.checkout.order_summary": setting.checkout.order_summary,
          "setting.checkout.apply_button": setting.checkout.apply_button,
          "setting.checkout.continue_button": setting.checkout.continue_button,
          "setting.checkout.confirm_button": setting.checkout.confirm_button,
          "setting.checkout.sub_total": setting.checkout.sub_total,
          "setting.checkout.discount": setting.checkout.discount,
          "setting.checkout.total_cost": setting.checkout.total_cost,

          //dashboard
          "setting.dashboard.invoice_message_first":
            setting.dashboard.invoice_message_first,
          "setting.dashboard.invoice_message_last":
            setting.dashboard.invoice_message_last,
          "setting.dashboard.print_button": setting.dashboard.print_button,
          "setting.dashboard.download_button":
            setting.dashboard.download_button,
          "setting.dashboard.dashboard_title":
            setting.dashboard.dashboard_title,
          "setting.dashboard.total_order": setting.dashboard.total_order,
          "setting.dashboard.pending_order": setting.dashboard.pending_order,

          "setting.dashboard.processing_order":
            setting.dashboard.processing_order,
          "setting.dashboard.complete_order": setting.dashboard.complete_order,
          "setting.dashboard.recent_order": setting.dashboard.recent_order,
          "setting.dashboard.my_order": setting.dashboard.my_order,
          "setting.dashboard.update_profile": setting.dashboard.update_profile,
          "setting.dashboard.full_name": setting.dashboard.full_name,
          "setting.dashboard.address": setting.dashboard.address,
          "setting.dashboard.user_email": setting.dashboard.user_email,
          "setting.dashboard.user_phone": setting.dashboard.user_phone,
          "setting.dashboard.update_button": setting.dashboard.update_button,
          "setting.dashboard.current_password":
            setting.dashboard.current_password,
          "setting.dashboard.new_password": setting.dashboard.new_password,
          "setting.dashboard.change_password":
            setting.dashboard.change_password,

          // about us
          "setting.about_us.header_status": setting.about_us.header_status,
          "setting.about_us.content_left_status":
            setting.about_us.content_left_status,
          "setting.about_us.content_right_status":
            setting.about_us.content_right_status,
          "setting.about_us.content_middle_status":
            setting.about_us.content_middle_status,
          "setting.about_us.content_middle_status":
            setting.about_us.content_middle_status,
          "setting.about_us.header_bg": setting.about_us.header_bg,
          "setting.about_us.content_right_img":
            setting.about_us.content_right_img,
          "setting.about_us.content_middle_Img":
            setting.about_us.content_middle_Img,
          "setting.about_us.founder_one_img": setting.about_us.founder_one_img,
          "setting.about_us.founder_two_img": setting.about_us.founder_two_img,
          "setting.about_us.founder_three_img":
            setting.about_us.founder_three_img,
          "setting.about_us.founder_four_img":
            setting.about_us.founder_four_img,
          "setting.about_us.founder_five_img":
            setting.about_us.founder_five_img,
          "setting.about_us.founder_six_img": setting.about_us.founder_six_img,
          "setting.about_us.title": setting.about_us.title,
          "setting.about_us.top_title": setting.about_us.top_title,
          "setting.about_us.top_description": setting.about_us.top_description,
          "setting.about_us.card_one_title": setting.about_us.card_one_title,
          "setting.about_us.card_one_sub": setting.about_us.card_one_sub,
          "setting.about_us.card_one_description":
            setting.about_us.card_one_description,
          "setting.about_us.card_two_title": setting.about_us.card_two_title,
          "setting.about_us.card_two_sub": setting.about_us.card_two_sub,
          "setting.about_us.card_two_description":
            setting.about_us.card_two_description,
          "setting.about_us.middle_description_one":
            setting.about_us.middle_description_one,
          "setting.about_us.middle_description_two":
            setting.about_us.middle_description_two,
          "setting.about_us.founder_title": setting.about_us.founder_title,
          "setting.about_us.founder_description":
            setting.about_us.founder_description,
          "setting.about_us.founder_one_name":
            setting.about_us.founder_one_name,
          "setting.about_us.founder_one_sub": setting.about_us.founder_one_sub,
          "setting.about_us.founder_two_name":
            setting.about_us.founder_two_name,
          "setting.about_us.founder_two_sub": setting.about_us.founder_two_name,
          "setting.about_us.founder_three_name":
            setting.about_us.founder_three_name,
          "setting.about_us.founder_three_sub":
            setting.about_us.founder_three_sub,
          "setting.about_us.founder_four_name":
            setting.about_us.founder_four_name,
          "setting.about_us.founder_four_sub":
            setting.about_us.founder_four_sub,
          "setting.about_us.founder_five_name":
            setting.about_us.founder_five_name,
          "setting.about_us.founder_five_sub":
            setting.about_us.founder_five_sub,
          "setting.about_us.founder_six_name":
            setting.about_us.founder_six_name,
          "setting.about_us.founder_six_sub": setting.about_us.founder_six_sub,

          //contact us
          "setting.contact_us.header_status": setting.contact_us.header_status,
          "setting.contact_us.email_box_status":
            setting.contact_us.email_box_status,
          "setting.contact_us.call_box_status":
            setting.contact_us.call_box_status,
          "setting.contact_us.address_box_status":
            setting.contact_us.address_box_status,
          "setting.contact_us.left_col_status":
            setting.contact_us.left_col_status,
          "setting.contact_us.form_status": setting.contact_us.form_status,
          "setting.contact_us.header_bg": setting.contact_us.header_bg,
          "setting.contact_us.left_col_img": setting.contact_us.left_col_img,
          "setting.contact_us.title": setting.contact_us.title,
          "setting.contact_us.email_box_title":
            setting.contact_us.email_box_title,
          "setting.contact_us.email_box_email":
            setting.contact_us.email_box_email,
          "setting.contact_us.email_box_text":
            setting.contact_us.email_box_text,
          "setting.contact_us.call_box_title":
            setting.contact_us.call_box_title,
          "setting.contact_us.call_box_phone":
            setting.contact_us.call_box_phone,
          "setting.contact_us.call_box_text": setting.contact_us.call_box_text,
          "setting.contact_us.address_box_title":
            setting.contact_us.address_box_title,
          "setting.contact_us.address_box_address_one":
            setting.contact_us.address_box_address_one,
          "setting.contact_us.address_box_address_two":
            setting.contact_us.address_box_address_two,
          "setting.contact_us.address_box_address_three":
            setting.contact_us.address_box_address_three,
          "setting.contact_us.form_title": setting.contact_us.form_title,
          "setting.contact_us.form_description":
            setting.contact_us.form_description,

          // privacy_policy
          "setting.privacy_policy.status": setting.privacy_policy.status,
          "setting.privacy_policy.header_bg": setting.privacy_policy.header_bg,
          "setting.privacy_policy.title": setting.privacy_policy.title,
          "setting.privacy_policy.description":
            setting.privacy_policy.description,

          //terms and condition
          "setting.term_and_condition.status":
            setting.term_and_condition.status,
          "setting.term_and_condition.header_bg":
            setting.term_and_condition.header_bg,
          "setting.term_and_condition.title": setting.term_and_condition.title,
          "setting.term_and_condition.description":
            setting.term_and_condition.description,

          // faq
          "setting.faq.page_status": setting.faq.page_status,
          "setting.faq.leftcol_status": setting.faq.leftcol_status,
          "setting.faq.rightcol_status": setting.faq.rightcol_status,
          "setting.faq.header_bg": setting.faq.header_bg,
          "setting.faq.left_img": setting.faq.left_img,
          "setting.faq.title": setting.faq.title,
          "setting.faq.faq_one": setting.faq.faq_one,
          "setting.faq.description_one": setting.faq.description_one,
          "setting.faq.faq_two": setting.faq.faq_two,
          "setting.faq.description_two": setting.faq.description_two,
          "setting.faq.faq_three": setting.faq.faq_three,
          "setting.faq.description_three": setting.faq.description_three,
          "setting.faq.faq_four": setting.faq.faq_four,
          "setting.faq.description_four": setting.faq.description_four,
          "setting.faq.faq_five": setting.faq.faq_five,
          "setting.faq.description_five": setting.faq.description_five,
          "setting.faq.faq_six": setting.faq.faq_six,
          "setting.faq.description_six": setting.faq.description_six,
          "setting.faq.faq_seven": setting.faq.faq_seven,
          "setting.faq.description_seven": setting.faq.description_seven,
          "setting.faq.faq_eight": setting.faq.faq_eight,
          "setting.faq.description_eight": setting.faq.description_eight,

          //offers
          "setting.offers.header_status": setting.offers.header_status,
          "setting.offers.header_bg": setting.offers.header_bg,
          "setting.offers.title": setting.offers.title,
          "setting.offers.coupon_code": setting.offers.coupon_code,

          //footer
          "setting.footer.promo_status": setting.footer.promo_status,
          "setting.footer.block1_status": setting.footer.block1_status,
          "setting.footer.block2_status": setting.footer.block2_status,
          "setting.footer.block3_status": setting.footer.block3_status,
          "setting.footer.block4_status": setting.footer.block4_status,
          "setting.footer.payment_method_status":
            setting.footer.payment_method_status,
          "setting.footer.bottom_contact_status":
            setting.footer.bottom_contact_status,
          "setting.footer.social_links_status":
            setting.footer.social_links_status,
          "setting.footer.shipping_card": setting.footer.shipping_card,
          "setting.footer.support_card": setting.footer.support_card,
          "setting.footer.payment_card": setting.footer.payment_card,
          "setting.footer.offer_card": setting.footer.offer_card,
          "setting.footer.block1_title": setting.footer.block1_title,
          "setting.footer.block1_sub_title1": setting.footer.block1_sub_title1,
          "setting.footer.block1_sub_link1": setting.footer.block1_sub_link1,
          "setting.footer.block1_sub_title2": setting.footer.block1_sub_title2,
          "setting.footer.block1_sub_link2": setting.footer.block1_sub_link2,
          "setting.footer.block1_sub_title3": setting.footer.block1_sub_title3,
          "setting.footer.block1_sub_link3": setting.footer.block1_sub_link3,
          "setting.footer.block1_sub_title4": setting.footer.block1_sub_title4,
          "setting.footer.block1_sub_link4": setting.footer.block1_sub_link4,
          "setting.footer.block2_title": setting.footer.block2_title,
          "setting.footer.block2_sub_title1": setting.footer.block2_sub_title1,
          "setting.footer.block2_sub_link1": setting.footer.block2_sub_link1,
          "setting.footer.block2_sub_title2": setting.footer.block2_sub_title2,
          "setting.footer.block2_sub_link2": setting.footer.block2_sub_link2,
          "setting.footer.block2_sub_title3": setting.footer.block2_sub_title3,
          "setting.footer.block2_sub_link3": setting.footer.block2_sub_link3,
          "setting.footer.block2_sub_title4": setting.footer.block2_sub_title4,
          "setting.footer.block2_sub_link4": setting.footer.block2_sub_link4,
          "setting.footer.block3_title": setting.footer.block3_title,
          "setting.footer.block3_sub_title1": setting.footer.block3_sub_title1,
          "setting.footer.block3_sub_link1": setting.footer.block3_sub_link1,
          "setting.footer.block3_sub_title2": setting.footer.block3_sub_title2,
          "setting.footer.block3_sub_link2": setting.footer.block3_sub_link2,
          "setting.footer.block3_sub_title3": setting.footer.block3_sub_title3,
          "setting.footer.block3_sub_link3": setting.footer.block3_sub_link3,
          "setting.footer.block3_sub_title4": setting.footer.block3_sub_title4,
          "setting.footer.block3_sub_link4": setting.footer.block3_sub_link4,
          "setting.footer.block4_logo": setting.footer.block4_logo,
          "setting.footer.block4_address": setting.footer.block4_address,
          "setting.footer.block4_phone": setting.footer.block4_phone,
          "setting.footer.block4_email": setting.footer.block4_email,
          "setting.footer.social_facebook": setting.footer.social_facebook,
          "setting.footer.social_twitter": setting.footer.social_twitter,
          "setting.footer.social_pinterest": setting.footer.social_pinterest,
          "setting.footer.social_linkedin": setting.footer.social_linkedin,
          "setting.footer.social_whatsapp": setting.footer.social_whatsapp,
          "setting.footer.payment_method_img":
            setting.footer.payment_method_img,
          "setting.footer.bottom_contact": setting.footer.bottom_contact,

          // slug page
          "setting.slug.right_box_status": setting.slug.right_box_status,
          "setting.slug.card_description_one":
            setting.slug.card_description_one,
          "setting.slug.card_description_two":
            setting.slug.card_description_two,
          "setting.slug.card_description_three":
            setting.slug.card_description_three,
          "setting.slug.card_description_four":
            setting.slug.card_description_four,
          "setting.slug.card_description_five":
            setting.slug.card_description_five,
          "setting.slug.card_description_six":
            setting.slug.card_description_six,
          "setting.slug.card_description_seven":
            setting.slug.card_description_seven,

          //seo setting
          "setting.seo.meta_img": setting.seo.meta_img,
          "setting.seo.favicon": setting.seo.favicon,
          "setting.seo.meta_title": setting.seo.meta_title,
          "setting.seo.meta_description": setting.seo.meta_description,
          "setting.seo.meta_keywords": setting.seo.meta_keywords,
          "setting.seo.meta_url": setting.seo.meta_url,
        },
      },
      {
        new: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.send({
      data: storeCustomizationSetting.setting,
      message: "Online Store Customization Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  addGlobalSetting,
  getGlobalSetting,
  updateGlobalSetting,
  addStoreSetting,
  getStoreSetting,
  updateStoreSetting,
  getStoreSeoSetting,
  addStoreCustomizationSetting,
  getStoreCustomizationSetting,
  updateStoreCustomizationSetting,
};
