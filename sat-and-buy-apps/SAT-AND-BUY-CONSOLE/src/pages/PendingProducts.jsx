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
import { FiCheckCircle, FiXCircle, FiSearch, FiExternalLink } from "react-icons/fi";

import AnimatedContent from "@/components/common/AnimatedContent";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const APPROVAL_COLORS = {
  pending:  "warning",
  approved: "success",
  rejected: "danger",
};

const APPROVAL_LABELS = {
  pending:  "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const RESULTS_PER_PAGE = 15;

const PendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalDoc, setTotalDoc] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProducts = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const res = await ProductServices.getAll({
          page: p,
          limit: RESULTS_PER_PAGE,
          price: statusFilter === "pending"   ? "pending"
               : statusFilter === "approved"  ? "published"
               : statusFilter === "rejected"  ? "unPublished"
               : undefined,
          title: search || undefined,
        });

        // Filtrer côté client sur approvalStatus car le backend filtre par status (show/hide)
        // On récupère tous et on filtre
        const filtered = statusFilter
          ? res.products.filter((p) => p.approvalStatus === statusFilter)
          : res.products.filter((p) => p.boutiqueId);

        setProducts(filtered);
        setTotalDoc(res.totalDoc);
        setPage(p);
      } catch (err) {
        notifyError(err?.message || "Erreur lors du chargement.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  // Charger directement via une requête filtrée par approvalStatus
  const fetchPending = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        // Utiliser le filtre approvalStatus natif via price param
        const params = { page: p, limit: RESULTS_PER_PAGE };
        if (search) params.title = search;

        // Appel direct selon le statut
        const res = await ProductServices.getAll(params);
        const filtered = res.products.filter((prod) =>
          statusFilter ? prod.approvalStatus === statusFilter && prod.boutiqueId : prod.boutiqueId
        );

        setProducts(filtered);
        setTotalDoc(filtered.length);
        setPage(p);
      } catch (err) {
        notifyError(err?.message || "Erreur lors du chargement.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  useEffect(() => {
    fetchPending(1);
  }, [fetchPending]);

  const handleApprove = async (product) => {
    setActionLoading(product._id + "approve");
    try {
      await ProductServices.updateApprovalStatus(product._id, { status: "approved" });
      // Après approbation, mettre status: show
      await ProductServices.updateStatus(product._id, { status: "show" });
      notifySuccess(`"${getTitle(product)}" approuvé et publié sur le store.`);
      fetchPending(page);
    } catch (err) {
      notifyError(err?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (product) => {
    setActionLoading(product._id + "reject");
    try {
      await ProductServices.updateApprovalStatus(product._id, { status: "rejected" });
      notifySuccess(`"${getTitle(product)}" rejeté.`);
      fetchPending(page);
    } catch (err) {
      notifyError(err?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const getTitle = (p) => {
    if (!p.title) return "Sans titre";
    if (typeof p.title === "string") return p.title;
    return p.title.fr || p.title.en || Object.values(p.title)[0] || "Sans titre";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(totalDoc / RESULTS_PER_PAGE);

  return (
    <>
      <PageTitle>Produits des boutiques</PageTitle>

      <AnimatedContent>
        {/* Filtres */}
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="w-52"
                />
                <Button type="submit" size="small" icon={FiSearch} aria-label="Rechercher" />
              </form>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Statut :</span>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-44"
                >
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvés</option>
                  <option value="rejected">Rejetés</option>
                  <option value="">Tous (boutiques)</option>
                </Select>
              </div>

              <span className="text-sm text-gray-400 ml-auto">
                {totalDoc} produit{totalDoc > 1 ? "s" : ""}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Tableau */}
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Produit</TableCell>
                <TableCell>Boutique</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </tr>
            </TableHeader>
            <tbody>
              {loading ? (
                <TableLoading row={6} col={6} />
              ) : products.length === 0 ? (
                <NotFound title="Aucun produit trouvé" />
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="dark:bg-gray-800">
                    {/* Produit */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image?.[0] ? (
                          <img
                            src={product.image[0]}
                            alt={getTitle(product)}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
                            {product.type === "service" ? "🛠" : "📦"}
                          </div>
                        )}
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                          {getTitle(product)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Boutique */}
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {product.boutiqueId
                          ? <span className="font-mono text-xs">{String(product.boutiqueId).slice(-6)}</span>
                          : "—"}
                      </span>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge type={product.type === "service" ? "primary" : "neutral"}>
                        {product.type === "service" ? "Service" : "Produit"}
                      </Badge>
                    </TableCell>

                    {/* Prix */}
                    <TableCell>
                      <span className="text-sm font-medium text-emerald-600">
                        {product.prices?.price != null
                          ? `${Number(product.prices.price).toLocaleString("fr-FR")} FCFA`
                          : "—"}
                      </span>
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <Badge type={APPROVAL_COLORS[product.approvalStatus] || "neutral"}>
                        {APPROVAL_LABELS[product.approvalStatus] || product.approvalStatus}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.approvalStatus === "pending" && (
                          <>
                            <Button
                              size="small"
                              layout="outline"
                              icon={FiCheckCircle}
                              onClick={() => handleApprove(product)}
                              disabled={!!actionLoading}
                              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            >
                              {actionLoading === product._id + "approve" ? "…" : "Approuver"}
                            </Button>
                            <Button
                              size="small"
                              layout="outline"
                              icon={FiXCircle}
                              onClick={() => handleReject(product)}
                              disabled={!!actionLoading}
                              className="text-red-500 border-red-300 hover:bg-red-50"
                            >
                              {actionLoading === product._id + "reject" ? "…" : "Rejeter"}
                            </Button>
                          </>
                        )}
                        {product.approvalStatus === "approved" && (
                          <Button
                            size="small"
                            layout="outline"
                            icon={FiXCircle}
                            onClick={() => handleReject(product)}
                            disabled={!!actionLoading}
                            className="text-red-500 border-red-300 hover:bg-red-50"
                          >
                            Retirer
                          </Button>
                        )}
                        {product.approvalStatus === "rejected" && (
                          <Button
                            size="small"
                            layout="outline"
                            icon={FiCheckCircle}
                            onClick={() => handleApprove(product)}
                            disabled={!!actionLoading}
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            Approuver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <TableFooter>
            <Pagination
              totalResults={Math.max(totalDoc, products.length)}
              resultsPerPage={RESULTS_PER_PAGE}
              onChange={(p) => fetchPending(p)}
              label="Produits boutiques pagination"
            />
          </TableFooter>
        </TableContainer>
      </AnimatedContent>
    </>
  );
};

export default PendingProducts;
