import requests from "./httpServices";

const MarketListServices = {
  create: (body) => requests.post("/customer/market-lists", body),
  find: () => requests.get("/customer/market-lists"),
  update: (id, body) => requests.put(`/customer/market-lists/${id}`, body),
};

export default MarketListServices;
