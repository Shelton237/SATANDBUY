import HttpService from "@/services/httpService";
import { withToken } from "@/utils/tokenHelper";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const http = new HttpService(API_BASE_URL, {
  "Content-Type": "application/json",
});

const STATUS = {
  SHOW: "show",
  HIDE: "hide",
};

const ATTRIBUTE_KEYWORDS = {
  sizes: ["size", "sizes"],
  colors: ["color", "colors"],
  brands: ["brand", "brands"],
};

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

const normalizeStatus = (status = STATUS.HIDE) => {
  const normalized = status?.toString().toLowerCase();
  if (normalized === STATUS.SHOW || normalized === "active") return STATUS.SHOW;
  return STATUS.HIDE;
};

const toUiStatus = (status) =>
  normalizeStatus(status) === STATUS.SHOW ? "ACTIVE" : "INACTIVE";

const toApiStatus = (status) => {
  if (!status) return STATUS.SHOW;
  const normalized = status.toString().toLowerCase();
  if (normalized === "inactive" || normalized === STATUS.HIDE) return STATUS.HIDE;
  return STATUS.SHOW;
};

const mapVariant = (variant = {}) => ({
  ...variant,
  id: variant._id?.toString() || variant.id,
  status: toUiStatus(variant.status),
  rawStatus: normalizeStatus(variant.status),
});

const mapAttribute = (attribute = {}) => ({
  ...attribute,
  id: attribute._id?.toString() || attribute.id,
  status: toUiStatus(attribute.status),
  rawStatus: normalizeStatus(attribute.status),
  variants: Array.isArray(attribute.variants)
    ? attribute.variants.map(mapVariant)
    : [],
});

const buildPagination = (items = []) => ({
  totalElements: items.length,
  totalPages: 1,
  size: items.length,
  number: 1,
  last: true,
  first: true,
});

const fetchAttributes = async (token, query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .forEach(([key, value]) => params.append(key, value));

  const url = params.toString() ? `/attributes?${params.toString()}` : "/attributes";
  const response = await http.get(url, token);
  const payload = Array.isArray(response?.data) ? response.data : [];
  return payload.map(mapAttribute);
};

const findAttributeByCode = (attributes, code = "") => {
  if (!code) return null;
  const normalizedCode = slugify(code);
  const keywordList = ATTRIBUTE_KEYWORDS[normalizedCode] || [];

  return (
    attributes.find(
      (attribute) =>
        attribute.id === code ||
        slugify(attribute.id) === normalizedCode ||
        keywordList.includes(slugify(attribute.title?.en)) ||
        keywordList.includes(slugify(attribute.title?.fr)) ||
        keywordList.includes(slugify(attribute.name?.en)) ||
        keywordList.includes(slugify(attribute.name?.fr)) ||
        slugify(attribute.title?.en) === normalizedCode ||
        slugify(attribute.name?.en) === normalizedCode
    ) || null
  );
};

const isObjectId = (value = "") =>
  /^[a-f\d]{24}$/i.test(value.trim());

const AttributeServices = {
  getAll: ({ page = 1, limit = 200, type, option } = {}, code) =>
    withToken(async (token) => {
      if (code && isObjectId(code)) {
        const response = await http.get(`/attributes/${code}`, token);
        const attribute = mapAttribute(response?.data || {});
        return {
          data: attribute.variants,
          variants: attribute.variants,
          attribute,
          pagination: buildPagination(attribute.variants),
        };
      }

      const attributes = await fetchAttributes(token, { type, option });

      if (code) {
        const targetAttribute = findAttributeByCode(attributes, code);
        if (!targetAttribute) {
          return {
            data: [],
            variants: [],
            attribute: null,
            pagination: buildPagination([]),
          };
        }

        return {
          data: targetAttribute.variants,
          variants: targetAttribute.variants,
          attribute: targetAttribute,
          pagination: buildPagination(targetAttribute.variants),
        };
      }

      return {
        data: attributes,
        pagination: {
          totalElements: attributes.length,
          totalPages: Math.max(1, Math.ceil(attributes.length / limit)),
          size: limit,
          number: page,
          last: page * limit >= attributes.length,
          first: page === 1,
        },
      };
    }),

  getShowingAttributes: () =>
    withToken(async (token) => {
      const response = await http.get("/attributes/show", token);
      const payload = Array.isArray(response?.data) ? response.data : [];
      return payload.map(mapAttribute);
    }),

  getById: (id) =>
    withToken(async (token) => {
      const response = await http.get(`/attributes/${id}`, token);
      return mapAttribute(response?.data || {});
    }),

  create: (data = {}) =>
    withToken(async (token) => {
      const payload = {
        ...data,
        status: toApiStatus(data.status),
      };
      const response = await http.post("/attributes/add", payload, token);
      return response?.data;
    }),

  addChildAttribute: (attributeId, childPayload) =>
    withToken(async (token) => {
      const payload = {
        ...childPayload,
        status: toApiStatus(childPayload?.status),
      };
      const response = await http.put(
        `/attributes/add/child/${attributeId}`,
        payload,
        token
      );
      return response?.data;
    }),

  addAllAttributes: (records = []) =>
    withToken(async (token) => {
      const payload = records.map((record) => ({
        ...record,
        status: toApiStatus(record?.status),
        variants: Array.isArray(record?.variants)
          ? record.variants.map((variant) => ({
              ...variant,
              status: toApiStatus(variant?.status),
            }))
          : [],
      }));

      const response = await http.post("/attributes/add/all", payload, token);
      return response?.data;
    }),

  update: (target, data = {}) =>
    withToken(async (token) => {
      if (typeof target === "object" && target !== null) {
        const { ids: attributeId, id: childId } = target;
        const payload = {
          ...data,
          status: toApiStatus(data?.status),
        };
        const response = await http.put(
          `/attributes/update/child/${attributeId}/${childId}`,
          payload,
          token
        );
        return response?.data;
      }

      const payload = {
        ...data,
        status: toApiStatus(data?.status),
      };
      const response = await http.put(`/attributes/${target}`, payload, token);
      return response?.data;
    }),

  updateStatus: (id, body = {}) =>
    withToken(async (token) => {
      const payload = {
        status: toApiStatus(body?.status),
      };
      const response = await http.put(`/attributes/status/${id}`, payload, token);
      return response?.data;
    }),

  updateChildStatus: (id, body = {}) =>
    withToken(async (token) => {
      const payload = {
        status: toApiStatus(body?.status),
      };
      const response = await http.put(
        `/attributes/status/child/${id}`,
        payload,
        token
      );
      return response?.data;
    }),

  updateManyAttribute: (payload = {}) =>
    withToken(async (token) => {
      const normalizedPayload = {
        ...payload,
        status: toApiStatus(payload?.status),
      };
      const response = await http.patch(
        "/attributes/update/many",
        normalizedPayload,
        token
      );
      return response?.data;
    }),

  updateManyChildAttribute: (payload = {}) =>
    withToken(async (token) => {
      const normalizedPayload = {
        ...payload,
        status: toApiStatus(payload?.status),
      };
      const response = await http.patch(
        "/attributes/update/child/many",
        normalizedPayload,
        token
      );
      return response?.data;
    }),

  delete: (id) =>
    withToken(async (token) => {
      const response = await http.delete(`/attributes/${id}`, token);
      return response?.data;
    }),

  deleteManyAttribute: (payload = {}) =>
    withToken(async (token) => {
      const response = await http.patch(
        "/attributes/delete/many",
        payload,
        token
      );
      return response?.data;
    }),

  deleteChildAttribute: (attributeId, childId) =>
    withToken(async (token) => {
      const response = await http.put(
        `/attributes/delete/child/${attributeId}/${childId}`,
        {},
        token
      );
      return response?.data;
    }),

  deleteManyChildAttribute: (payload = {}) =>
    withToken(async (token) => {
      const response = await http.patch(
        "/attributes/delete/child/many",
        payload,
        token
      );
      return response?.data;
    }),

  getCounts: () =>
    withToken(async (token) => {
      const attributes = await fetchAttributes(token);
      return Object.keys(ATTRIBUTE_KEYWORDS).reduce((acc, key) => {
        const keywords = ATTRIBUTE_KEYWORDS[key];
        const attribute = attributes.find((item) => {
          const names = [
            slugify(item.title?.en),
            slugify(item.title?.fr),
            slugify(item.name?.en),
            slugify(item.name?.fr),
          ];
          return names.some((name) => keywords.includes(name));
        });
        acc[key] = attribute ? attribute.variants.length : 0;
        return acc;
      }, {});
    }),
};

export default AttributeServices;
