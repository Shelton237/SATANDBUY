import {
  Badge,
  Button,
  Card,
  CardBody,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Pagination,
} from "@windmill/react-ui";
import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiTrash2, FiEye } from "react-icons/fi";

import AnimatedContent from "@/components/common/AnimatedContent";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import BoutiqueServices from "@/services/BoutiqueServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const STATUS_COLORS = {
  active: "success",
  pending: "warning",
  suspended: "danger",
};

const STATUS_LABELS = {
  active: "Active",
  pending: "En attente",
  suspended: "Suspendue",
};

const BUSINESS_TYPE_LABELS = {
  medical: "Médical",
  it_services: "Services IT",
  internet: "Connexion Internet",
  clothing: "Vêtements & Chaussures",
  food_beverages: "Jus & Alimentation",
  naturopathy: "Naturopathie",
  education: "Éducation",
  beauty: "Beauté",
  real_estate: "Immobilier",
  transport: "Transport",
  other: "Autre",
};

const RESULTS_PER_PAGE = 15;

const Boutiques = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBoutiques = async (p = 1) => {
    setLoading(true);
    try {
      const res = await BoutiqueServices.adminListBoutiques({
        status: statusFilter,
        page: p,
        limit: RESULTS_PER_PAGE,
      });
      setBoutiques(res.data?.boutiques || []);
      setTotal(res.data?.total || 0);
      setPage(p);
    } catch (err) {
      notifyError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiques(1);
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    setActionLoading(id + status);
    try {
      await BoutiqueServices.adminUpdateStatus(id, { status });
      notifySuccess(`Boutique ${STATUS_LABELS[status].toLowerCase()}.`);
      fetchBoutiques(page);
    } catch (err) {
      notifyError(err?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (id, verified) => {
    setActionLoading(id + "verify");
    try {
      await BoutiqueServices.adminUpdateStatus(id, { verified });
      notifySuccess(verified ? "Boutique vérifiée." : "Vérification retirée.");
      fetchBoutiques(page);
    } catch (err) {
      notifyError(err?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette boutique définitivement ?")) return;
    setActionLoading(id + "delete");
    try {
      await BoutiqueServices.adminDeleteBoutique(id);
      notifySuccess("Boutique supprimée.");
      fetchBoutiques(page);
    } catch (err) {
      notifyError(err?.message || "Erreur.");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE);

  return (
    <>
      <PageTitle>Boutiques & Entreprises</PageTitle>

      <AnimatedContent>
        {/* Filtres */}
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Statut :</span>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="active">Actives</option>
                  <option value="suspended">Suspendues</option>
                </Select>
              </div>
              <span className="text-sm text-gray-400">{total} boutique{total > 1 ? "s" : ""}</span>
            </div>
          </CardBody>
        </Card>

        {/* Tableau */}
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Boutique</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Propriétaire</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Abonnés</TableCell>
                <TableCell>Actions</TableCell>
              </tr>
            </TableHeader>
            <tbody>
              {loading ? (
                <TableLoading row={6} col={6} />
              ) : boutiques.length === 0 ? (
                <NotFound title="Aucune boutique trouvée" />
              ) : (
                boutiques.map((b) => (
                  <tr key={b._id} className="dark:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {b.logo ? (
                          <img src={b.logo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                            {b.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {b.name}
                            {b.verified && (
                              <span className="ml-1 text-emerald-500">✓</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{b.city || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {BUSINESS_TYPE_LABELS[b.businessType] || "Autre"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">{b.owner?.email || b.owner || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge type={STATUS_COLORS[b.status] || "neutral"}>
                        {STATUS_LABELS[b.status] || b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{b.followersCount}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {b.status !== "active" && (
                          <Button
                            size="small"
                            layout="link"
                            className="text-emerald-500"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(b._id, "active")}
                          >
                            <FiCheckCircle title="Activer" />
                          </Button>
                        )}
                        {b.status !== "suspended" && (
                          <Button
                            size="small"
                            layout="link"
                            className="text-orange-500"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(b._id, "suspended")}
                          >
                            <FiXCircle title="Suspendre" />
                          </Button>
                        )}
                        {b.status !== "pending" && (
                          <Button
                            size="small"
                            layout="link"
                            className="text-gray-400"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(b._id, "pending")}
                          >
                            <FiEye title="Mettre en attente" />
                          </Button>
                        )}
                        <Button
                          size="small"
                          layout="link"
                          className={b.verified ? "text-emerald-500" : "text-gray-400"}
                          disabled={!!actionLoading}
                          onClick={() => handleVerify(b._id, !b.verified)}
                          title={b.verified ? "Retirer la vérification" : "Marquer comme vérifié"}
                        >
                          ✓
                        </Button>
                        <Button
                          size="small"
                          layout="link"
                          className="text-red-500"
                          disabled={!!actionLoading}
                          onClick={() => handleDelete(b._id)}
                        >
                          <FiTrash2 title="Supprimer" />
                        </Button>
                      </div>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <TableFooter>
            <Pagination
              totalResults={total}
              resultsPerPage={RESULTS_PER_PAGE}
              onChange={(p) => fetchBoutiques(p)}
              label="Boutiques"
            />
          </TableFooter>
        </TableContainer>
      </AnimatedContent>
    </>
  );
};

export default Boutiques;
