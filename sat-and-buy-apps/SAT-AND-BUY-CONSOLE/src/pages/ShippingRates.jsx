import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useMemo, useState } from "react";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import TableLoading from "@/components/preloader/TableLoading";
import useAsync from "@/hooks/useAsync";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";
import ShippingRateServices from "@/services/ShippingRateServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import MainDrawer from "@/components/drawer/MainDrawer";
import ShippingRateDrawer from "@/components/drawer/ShippingRateDrawer";

const approvalLabels = {
  pending: "En attente admin",
  approved: "Validée",
  rejected: "Rejetée",
};

const approvalClasses = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const formatUserDisplay = (user) => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  return user.name || user.email || "—";
};

const ShippingRates = () => {
  const { setIsUpdate, serviceId, setServiceId, setIsDrawerOpen } =
    useContext(SidebarContext);
  const { authData } = useContext(AdminContext);
  const { data = [], loading, error } = useAsync(() =>
    ShippingRateServices.getAll()
  );

  const [filterCountry, setFilterCountry] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterApproval, setFilterApproval] = useState("all");

  const role = authData?.user?.role;
  const isAdmin = role === "Admin";
  const tableColumns = isAdmin ? 8 : 7;

  const approvalMessage = isAdmin
    ? "Validez les tarifs proposés par les livreurs avant qu'ils soient visibles au checkout."
    : "Vos tarifs restent invisibles sur le checkout tant qu'un administrateur ne les a pas validés.";

  const filteredRates = useMemo(() => {
    return (data || []).filter((rate) => {
      const matchesCountry = filterCountry
        ? rate.country?.toLowerCase().includes(filterCountry.toLowerCase())
        : true;
      const matchesCity = filterCity
        ? rate.city?.toLowerCase().includes(filterCity.toLowerCase())
        : true;
      const matchesStatus =
        filterStatus === "all" ? true : rate.status === filterStatus;
      const matchesApproval =
        filterApproval === "all"
          ? true
          : rate.approvalStatus === filterApproval;
      return matchesCountry && matchesCity && matchesStatus && matchesApproval;
    });
  }, [data, filterCountry, filterCity, filterStatus, filterApproval]);

  const selectedRate = useMemo(() => {
    if (!serviceId) return null;
    return (data || []).find((rate) => rate.id === serviceId) || null;
  }, [data, serviceId]);

  const openCreateDrawer = () => {
    setServiceId(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (rate) => {
    if (!rate?.id) return;
    setServiceId(rate.id);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (rate) => {
    if (!confirm(`Delete shipping rate "${rate.label}" for ${rate.city}?`)) {
      return;
    }
    try {
      await ShippingRateServices.remove(rate.id);
      notifySuccess("Shipping rate deleted.");
      setIsUpdate(true);
    } catch (err) {
      notifyError(err?.message || "Unable to delete shipping rate.");
    }
  };

  const handleApprovalChange = async (rate, nextStatus) => {
    if (!rate?.id) return;
    try {
      await ShippingRateServices.update(rate.id, {
        approvalStatus: nextStatus,
      });
      let message = "Statut mis à jour.";
      if (nextStatus === "approved") {
        message = "Tarif validé: il sera proposé au checkout.";
      } else if (nextStatus === "rejected") {
        message = "Tarif rejeté.";
      } else if (nextStatus === "pending") {
        message = "Validation réinitialisée.";
      }
      notifySuccess(message);
      setIsUpdate(true);
    } catch (err) {
      notifyError(err?.message || "Impossible de modifier la validation.");
    }
  };

  const renderApprovalControls = (rate) => {
    if (!isAdmin) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {rate.approvalStatus !== "approved" && (
          <Button
            size="small"
            onClick={() => handleApprovalChange(rate, "approved")}
            className="h-8 text-xs bg-emerald-600 text-white border-emerald-600"
          >
            Valider
          </Button>
        )}
        {rate.approvalStatus === "approved" ? (
          <Button
            size="small"
            layout="outline"
            onClick={() => handleApprovalChange(rate, "pending")}
            className="h-8 text-xs border-amber-300 text-amber-700"
          >
            Rep. en attente
          </Button>
        ) : (
          <Button
            size="small"
            layout="outline"
            onClick={() => handleApprovalChange(rate, "rejected")}
            className="h-8 text-xs border-red-300 text-red-600"
          >
            Rejeter
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <PageTitle>Shipping Rates</PageTitle>

      <MainDrawer>
        <ShippingRateDrawer rate={selectedRate} isAdmin={isAdmin} />
      </MainDrawer>

      <div className="mb-4 p-4 rounded border border-blue-100 bg-blue-50 text-sm text-blue-800">
        {approvalMessage}
      </div>
      <AnimatedContent>
        <Card className="mb-6">
          <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-200 font-semibold">
                Gérer les tarifs d'expédition
              </p>
              <p className="text-sm text-gray-500">
                Ajoutez vos zones / tarifs puis soumettez-les pour validation.
              </p>
            </div>
            <Button
              onClick={openCreateDrawer}
              className="h-12 w-full md:w-auto flex items-center justify-center gap-2"
            >
              <FiPlus />
              Nouveau tarif
            </Button>
          </CardBody>
        </Card>
      </AnimatedContent>

      <Card className="mb-4">
        <CardBody>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Filter by country"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            />
            <Input
              placeholder="Filter by city"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
            >
              <option value="all">All validation states</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <TableLoading row={8} col={tableColumns} width={160} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : filteredRates.length ? (
        <TableContainer className="mb-8 rounded-b-lg">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Label</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>ETA</TableCell>
                <TableCell>Status</TableCell>
                {isAdmin && <TableCell>Livreur</TableCell>}
                <TableCell>Validation</TableCell>
                <TableCell className="text-right">Actions</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredRates.map((rate) => (
                <tr key={rate.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{rate.label}</span>
                      <span className="text-xs text-gray-500">
                        {rate.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{rate.country}</span>
                      <span className="text-gray-600">{rate.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {Number(rate.cost || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>{rate.estimatedTime || "--"}</TableCell>
                  <TableCell className="capitalize">{rate.status}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold">
                          {formatUserDisplay(rate.createdBy)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {rate.createdBy?.email || "—"}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          approvalClasses[rate.approvalStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {approvalLabels[rate.approvalStatus] ||
                          approvalLabels.pending}
                      </span>
                      {rate.approvedBy && (
                        <span className="text-xs text-gray-500 mt-1">
                          Validé par {formatUserDisplay(rate.approvedBy)}
                        </span>
                      )}
                      {renderApprovalControls(rate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      type="button"
                      layout="outline"
                      onClick={() => handleEdit(rate)}
                      className="h-10"
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      type="button"
                      layout="outline"
                      onClick={() => handleDelete(rate)}
                      className="h-10 border-red-200 text-red-600"
                    >
                      <FiTrash2 />
                    </Button>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <span className="text-center mx-auto text-gray-500">
          No shipping rates yet.
        </span>
      )}
    </>
  );
};

export default ShippingRates;
