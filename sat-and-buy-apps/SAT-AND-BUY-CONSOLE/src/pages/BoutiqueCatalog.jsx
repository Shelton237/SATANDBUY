import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Pagination,
} from "@windmill/react-ui";
import React, { useState, useEffect, useCallback } from "react";
import { FiStar, FiXCircle, FiSearch } from "react-icons/fi";

import AnimatedContent from "@/components/common/AnimatedContent";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import BoutiqueServices from "@/services/BoutiqueServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const TYPE_LABELS = { product: "Produit", service: "Service" };
const RESULTS_PER_PAGE = 15;

const BoutiqueCatalog = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchItems = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const res = await BoutiqueServices.adminListCatalog({
          page: p,
          limit: RESULTS_PER_PAGE,
          featured: featuredFilter,
          type: typeFilter,
          search,
        });
        setItems(res.data?.items || []);
        setTotal(res.data?.total || 0);
        setPage(p);
      } catch (err) {
        notifyError(err?.message || "Erreur lors du chargement.");
      } finally {
        setLoading(false);
      }
    },
    [featuredFilter, typeFilter, search]
  );

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  const handleToggleFeature = async (item) => {
    setActionLoading(item._id);
    try {
      const res = await BoutiqueServices.adminToggleFeature(item._id);
      notifySuccess(res.data?.message || "Statut mis à jour.");
      fetchItems(page);
    } catch (err) {
      notifyError(err?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE);

  return (
    <>
      <PageTitle>Catalogue des boutiques</PageTitle>

      <AnimatedContent>
        {/* Filtres */}
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
              {/* Recherche */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Rechercher un article…"
                  className="w-52"
                />
                <Button type="submit" size="small" icon={FiSearch} aria-label="Rechercher" />
              </form>

              {/* Filtre statut */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Statut :</span>
                <Select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="w-44"
                >
                  <option value="">Tous</option>
                  <option value="false">En attente</option>
                  <option value="true">Mis en avant</option>
                </Select>
              </div>

              {/* Filtre type */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Type :</span>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-36"
                >
                  <option value="">Tous</option>
                  <option value="product">Produit</option>
                  <option value="service">Service</option>
                </Select>
              </div>

              <span className="text-sm text-gray-400 ml-auto">
                {total} article{total > 1 ? "s" : ""}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Tableau */}
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Article</TableCell>
                <TableCell>Boutique</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Action</TableCell>
              </tr>
            </TableHeader>
            <tbody>
              {loading ? (
                <TableLoading row={6} col={6} />
              ) : items.length === 0 ? (
                <NotFound title="Aucun article trouvé" />
              ) : (
                items.map((item) => {
                  const boutique = item.boutiqueId;
                  return (
                    <tr key={item._id} className="dark:bg-gray-800">
                      {/* Article */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
                              {item.type === "service" ? "🛠" : "📦"}
                            </div>
                          )}
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300 max-w-[180px] truncate">
                            {item.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Boutique */}
                      <TableCell>
                        {boutique ? (
                          <div className="flex items-center gap-2">
                            {boutique.logo ? (
                              <img
                                src={boutique.logo}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                                {boutique.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                              {boutique.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge type={item.type === "service" ? "primary" : "neutral"}>
                          {TYPE_LABELS[item.type] || item.type}
                        </Badge>
                      </TableCell>

                      {/* Prix */}
                      <TableCell>
                        <span className="text-sm font-medium text-emerald-600">
                          {item.price != null
                            ? `${item.price.toLocaleString("fr-FR")} ${item.currency}`
                            : "—"}
                        </span>
                      </TableCell>

                      {/* Statut */}
                      <TableCell>
                        <Badge type={item.featured ? "success" : "warning"}>
                          {item.featured ? "Mis en avant" : "En attente"}
                        </Badge>
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <Button
                          size="small"
                          layout="outline"
                          onClick={() => handleToggleFeature(item)}
                          disabled={actionLoading === item._id}
                          icon={item.featured ? FiXCircle : FiStar}
                          className={
                            item.featured
                              ? "text-red-500 border-red-300 hover:bg-red-50"
                              : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          }
                        >
                          {actionLoading === item._id
                            ? "..."
                            : item.featured
                            ? "Retirer"
                            : "Valider"}
                        </Button>
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
          <TableFooter>
            <Pagination
              totalResults={total}
              resultsPerPage={RESULTS_PER_PAGE}
              onChange={(p) => fetchItems(p)}
              label="Catalogue pagination"
            />
          </TableFooter>
        </TableContainer>
      </AnimatedContent>
    </>
  );
};

export default BoutiqueCatalog;
