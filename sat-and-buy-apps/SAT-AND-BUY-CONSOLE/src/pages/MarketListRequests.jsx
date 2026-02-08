import { Badge, Button, Card, CardBody, Input, Label, Pagination, Table, TableBody, TableCell, TableContainer, TableFooter, TableHeader, TableRow, Select } from "@windmill/react-ui";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import PageTitle from "@/components/Typography/PageTitle";
import MarketListRequestsService from "@/services/MarketListRequestsService";
import { notifyError, notifySuccess } from "@/utils/toast";
import AnimatedContent from "@/components/common/AnimatedContent";

const STATUS_OPTIONS = [
  { label: "Toutes", value: "" },
  { label: "En attente", value: "pending" },
  { label: "Validée", value: "validated" },
  { label: "Annulée", value: "cancelled" },
];

const STATUS_BADGE_TYPES = {
  pending: "warning",
  validated: "success",
  cancelled: "danger",
};

const formatStatusLabel = (value) => {
  if (!value) return "-";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

const MarketListRequests = () => {
  const { t } = useTranslation();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalDoc, setTotalDoc] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await MarketListRequestsService.adminFind({
        status: statusFilter,
        customerName,
        page,
        limit,
      });
      setLists(response.lists || []);
      setTotalDoc(response.totalDoc || 0);
    } catch (err) {
      setError(err?.message || "Impossible de charger les listes.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, customerName, page, limit]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleSearch = () => {
    setCustomerName(searchInput);
    setPage(1);
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await MarketListRequestsService.updateStatus(id, status);
      notifySuccess("Statut mis à jour.");
      fetchLists();
    } catch (err) {
      notifyError(err?.message || "Impossible de mettre à jour le statut.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleDetails = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <PageTitle>{t("MarketRequests", "Listes de marché")}</PageTitle>
          <p className="text-sm text-gray-500">
            {t(
              "MarketRequestsSubtitle",
              "Validez ou annulez les demandes soumises par les clients."
            )}
          </p>
        </div>
      </div>

      <AnimatedContent>
        <Card className="mt-4">
          <CardBody>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Recherche client</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Nom du client..."
                  />
                  <Button onClick={handleSearch} layout="outline">
                    {t("Search", "Rechercher")}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Statut</Label>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Page</Label>
                <Input
                  type="number"
                  min={1}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-500">
                  {totalDoc} {t("requests", "demandes")}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-4">
          <CardBody>
            {loading ? (
              <p className="text-sm text-gray-500">Chargement...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <TableContainer className="mt-4">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>Client</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        Articles
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {lists.map((list) => (
                      <Fragment key={list._id}>
                        <TableRow>
                          <TableCell className="font-semibold">
                            {list.customer?.name || "-"}
                            <p className="text-xs text-gray-400">
                              {list.customer?.email || "-"}
                            </p>
                          </TableCell>
                          <TableCell>
                            {list.totalValue?.toLocaleString("fr-FR")} FCFA
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {list.items?.length || 0}
                          </TableCell>
                          <TableCell>
                            <Badge type={STATUS_BADGE_TYPES[list.status]}>
                              {formatStatusLabel(list.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(list.createdAt).toLocaleString("fr-FR")}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              size="small"
                              disabled={
                                list.status === "validated" ||
                                updatingId === list._id
                              }
                              onClick={() => handleUpdateStatus(list._id, "validated")}
                              className="bg-emerald-500 text-white"
                            >
                              {updatingId === list._id ? "..." : "Valider"}
                            </Button>
                            <Button
                              size="small"
                              layout="outline"
                              disabled={
                                list.status === "cancelled" ||
                                updatingId === list._id
                              }
                              onClick={() => handleUpdateStatus(list._id, "cancelled")}
                            >
                              {updatingId === list._id ? "..." : "Annuler"}
                            </Button>
                            <Button
                              size="small"
                              layout="outline"
                              onClick={() => handleToggleDetails(list._id)}
                            >
                              {expandedId === list._id
                                ? "Masquer les produits"
                                : "Voir les produits"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedId === list._id && (
                          <TableRow key={`${list._id}-detail`}>
                            <TableCell colSpan={6} className="bg-gray-50">
                              {list.items?.length ? (
                                <div className="grid gap-2">
                                  {list.items.map((item, index) => (
                                    <div
                                      key={`${list._id}-item-${index}`}
                                      className="flex flex-wrap items-center gap-4 text-sm text-gray-700"
                                    >
                                      <span className="w-full md:w-1/2 font-semibold">
                                        {item.productTitle || "Produit sans titre"}
                                      </span>
                                      <span className="w-1/6 text-center">
                                        Qte: {item.quantity}
                                      </span>
                                      <span className="w-1/6 text-center">
                                        Prix:{" "}
                                        {item.desiredPrice?.toLocaleString("fr-FR") ||
                                          "0"}{" "}
                                        FCFA
                                      </span>
                                      <span className="w-1/6 text-right text-xs text-gray-500">
                                        {item.productSlug || ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  Aucun article détaillé pour cette liste.
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
                <TableFooter>
                  <Pagination
                    totalResults={totalDoc}
                    resultsPerPage={limit}
                    label="navigation"
                    onChange={(p) => setPage(p)}
                    currentPage={page}
                  />
                </TableFooter>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </AnimatedContent>
    </div>
  );
};

export default MarketListRequests;
