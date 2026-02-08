import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Input, Label, Select, Textarea } from "@windmill/react-ui";

import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";
import OrderServices from "@/services/OrderServices";
import AdminServices from "@/services/AdminServices";
import UserService from "@/services/UserService";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError, notifySuccess } from "@/utils/toast";
import { DEFAULT_DRIVER_SLOTS } from "@/constants/delivery";

const DEFAULT_PLAN = {
  assignedDriver: "",
  deliveryDate: "",
  deliveryWindow: "",
  notes: "",
};
const MIN_SLOT_DURATION_MINUTES = 10;
const TIME_VALUE_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const OrderWorkflowDrawer = () => {
  const { serviceId, setIsUpdate } = useContext(SidebarContext);
  const { authData } = useContext(AdminContext);
  const { showDateTimeFormat } = useUtilsFunction();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sortingNotes, setSortingNotes] = useState("");
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [drivers, setDrivers] = useState([]);
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [takenSlots, setTakenSlots] = useState([]);
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [windowError, setWindowError] = useState("");
  const skipPlanWindowSyncRef = useRef(false);

  const role = authData?.user?.role;
  const currentUserId =
    authData?.user?.id || authData?.user?._id || authData?._id || null;

  const canOrganize = role === "Trieur" || role === "Admin";
  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedDriverId) || null,
    [drivers, selectedDriverId]
  );
  const baseDriverSlots =
    selectedDriver?.availabilitySlots && selectedDriver.availabilitySlots.length
      ? selectedDriver.availabilitySlots
      : DEFAULT_DRIVER_SLOTS;

  const parseWindowValue = useCallback((windowValue = "") => {
    if (!windowValue) {
      return { start: "", end: "" };
    }
    const [startRaw = "", endRaw = ""] = windowValue.split("-");
    const start = startRaw.trim();
    const end = endRaw.trim();

    return {
      start: TIME_VALUE_PATTERN.test(start) ? start : "",
      end: TIME_VALUE_PATTERN.test(end) ? end : "",
    };
  }, []);

  const timeToMinutes = useCallback((value = "") => {
    if (!TIME_VALUE_PATTERN.test(value)) {
      return null;
    }
    const [hours, minutes] = value.split(":").map((chunk) => parseInt(chunk, 10));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }
    return hours * 60 + minutes;
  }, []);

  const validateWindowRange = useCallback(
    (start, end) => {
      if (!start || !end) {
        return { error: "Sélectionnez une heure de début et de fin." };
      }
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      if (startMinutes === null || endMinutes === null) {
        return { error: "Format horaire invalide." };
      }
      if (endMinutes <= startMinutes) {
        return {
          error: "L'heure de fin doit être supérieure à l'heure de début.",
        };
      }
      if (endMinutes - startMinutes < MIN_SLOT_DURATION_MINUTES) {
        return {
          error: `Choisissez une durée d'au moins ${MIN_SLOT_DURATION_MINUTES} minutes.`,
        };
      }
      const overlaps = takenSlots.some(
        (slot) =>
          typeof slot.startMinutes === "number" &&
          typeof slot.endMinutes === "number" &&
          slot.startMinutes < endMinutes &&
          slot.endMinutes > startMinutes
      );
      if (overlaps) {
        return { error: "Ce créneau chevauche déjà une autre livraison." };
      }
      return { error: "", startMinutes, endMinutes };
    },
    [takenSlots, timeToMinutes]
  );

  const commitWindowValue = useCallback(
    (nextStart, nextEnd) => {
      setWindowStart(nextStart);
      setWindowEnd(nextEnd);
      if (!nextStart || !nextEnd) {
        setWindowError("");
        if (nextStart || nextEnd) {
          skipPlanWindowSyncRef.current = true;
        }
        setPlan((prev) => ({ ...prev, deliveryWindow: "" }));
        return;
      }
      const validation = validateWindowRange(nextStart, nextEnd);
      if (validation.error) {
        setWindowError(validation.error);
        skipPlanWindowSyncRef.current = true;
        setPlan((prev) => ({ ...prev, deliveryWindow: "" }));
        return;
      }
      setWindowError("");
      setPlan((prev) => ({
        ...prev,
        deliveryWindow: `${nextStart} - ${nextEnd}`,
      }));
    },
    [validateWindowRange]
  );

  const handleWindowFieldChange = useCallback(
    (field) => (event) => {
      const value = event.target.value;
      if (field === "start") {
        commitWindowValue(value, windowEnd);
      } else {
        commitWindowValue(windowStart, value);
      }
    },
    [commitWindowValue, windowEnd, windowStart]
  );

  const applySuggestedSlot = useCallback(
    (slotValue) => {
      if (!slotValue) return;
      const [startRaw = "", endRaw = ""] = slotValue.split("-");
      commitWindowValue(startRaw.trim(), endRaw.trim());
    },
    [commitWindowValue]
  );

  const loadOrder = useCallback(async () => {
    if (!serviceId) {
      setOrder(null);
      return;
    }
    setLoading(true);
    try {
      const res = await OrderServices.getOrderById(serviceId);
      setOrder(res);
      setSortingNotes(res?.sorting?.notes || "");
      const planDate = res?.deliveryPlan?.deliveryDate
        ? new Date(res.deliveryPlan.deliveryDate).toISOString().slice(0, 10)
        : "";
      setPlan({
        assignedDriver: res?.deliveryPlan?.assignedDriver || "",
        deliveryDate: planDate,
        deliveryWindow: res?.deliveryPlan?.deliveryWindow || "",
        notes: res?.deliveryPlan?.notes || "",
      });
      setSelectedDriverId(
        res?.deliveryPlan?.driverId?.toString?.() ||
          res?.deliveryPlan?.driverId ||
          ""
      );
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      loadOrder();
    } else {
      setOrder(null);
    }
  }, [serviceId, loadOrder]);

  useEffect(() => {
    if (skipPlanWindowSyncRef.current) {
      skipPlanWindowSyncRef.current = false;
      return;
    }
    const { start, end } = parseWindowValue(plan.deliveryWindow);
    setWindowStart(start);
    setWindowEnd(end);
    if (!plan.deliveryWindow) {
      setWindowError("");
    }
  }, [plan.deliveryWindow, parseWindowValue]);

  const sortingStatus = order?.sorting?.status || "Pending";
  const sortingItems = order?.sorting?.items || [];

  const getItemId = (item) =>
    item?._id?.toString?.() || item?._id || item?.productId || item?.sku;

  const getItemName = (item) => {
    if (!item) return "Produit";
    const title = item.title;
    if (typeof title === "string") return title;
    if (title?.fr) return title.fr;
    if (title?.en) return title.en;
    return item.sku || item.productId || "Produit";
  };

  const getItemImage = (item) => {
    if (!item) return "";
    if (item.image) return item.image;
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return "";
  };

  const getItemStatusLabel = (status) => {
    switch (status) {
      case "Checked":
        return "Présent";
      case "Missing":
        return "Manquant";
      default:
        return "En attente";
    }
  };

  const canStartSorting = useMemo(() => {
    if (!order) return false;
    return ["Pending", "Sorting"].includes(order.status);
  }, [order]);

  const allItemsReviewed =
    sortingItems.length > 0 &&
    sortingItems.every((item) => item.status !== "Pending");

  const canCompleteSorting =
    sortingStatus === "InProgress" && sortingItems.length > 0 && allItemsReviewed;
  const canPlanDelivery =
    sortingStatus === "Completed" ||
    ["ReadyForDelivery", "Processing"].includes(order?.status);
  const checklistDisabled = !canOrganize || sortingStatus !== "InProgress";
  const formatDriverDisplay = useCallback((driver) => {
    if (!driver) return "";
    const fullName = [driver.firstName, driver.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || driver.email || driver.username || "Livreur";
  }, []);

  useEffect(() => {
    if (selectedDriverId || !plan?.assignedDriver || drivers.length === 0) {
      if (!plan?.assignedDriver && !selectedDriverId) {
        setSelectedDriverId("");
      }
      return;
    }
    const normalized = plan.assignedDriver.trim().toLowerCase();
    const match = drivers.find((driver) => {
      const label = formatDriverDisplay(driver).toLowerCase();
      const email = (driver.email || "").toLowerCase();
      return (
        normalized === label ||
        label === normalized ||
        normalized.includes(label) ||
        label.includes(normalized) ||
        (email && normalized.includes(email))
      );
    });
    setSelectedDriverId(match?.id || "");
  }, [plan?.assignedDriver, drivers, formatDriverDisplay, selectedDriverId]);

  useEffect(() => {
    let mounted = true;
    const fetchDrivers = async () => {
      setDriverLoading(true);
      setDriverError("");
      try {
        const staff = await UserService.getAllUsers();
        if (!mounted) return;
        const onlyDrivers = (staff || []).filter((user) => {
          const roles = user.roles || [];
          return roles.includes("Livreur") || user.role === "Livreur";
        });
        setDrivers(onlyDrivers);
        if (onlyDrivers.length === 0) {
          setDriverError("Aucun livreur actif enregistré pour le moment.");
        }
      } catch (err) {
        if (!mounted) return;
        setDriverError(err?.message || "Impossible de récupérer les livreurs.");
      } finally {
        if (mounted) {
          setDriverLoading(false);
        }
      }
    };
    fetchDrivers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDriverId) {
      setAvailableSlots([]);
      setTakenSlots([]);
      setSlotsError("");
      return;
    }
    if (!plan.deliveryDate) {
      setAvailableSlots([]);
      setTakenSlots([]);
      setSlotsError("Choisissez une date de livraison pour consulter les disponibilit?s du livreur.");
      return;
    }
    let mounted = true;
    setSlotsLoading(true);
    setSlotsError("");
    AdminServices.getDriverAvailability(selectedDriverId, {
      date: plan.deliveryDate,
      orderId: serviceId,
    })
      .then((response) => {
        if (!mounted) return;
        const payload = response?.data || response || {};
        setAvailableSlots(payload.slots || []);
        setTakenSlots(Array.isArray(payload.taken) ? payload.taken : []);
      })
      .catch((error) => {
        if (!mounted) return;
        setSlotsError(
          error?.response?.data?.message ||
            error?.message ||
            "Impossible de charger les cr?neaux."
        );
        setAvailableSlots([]);
        setTakenSlots([]);
      })
      .finally(() => {
        if (mounted) {
          setSlotsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [selectedDriverId, plan.deliveryDate, serviceId, baseDriverSlots]);

  useEffect(() => {
    if (!selectedDriverId) {
      setPlan((prev) => ({ ...prev, deliveryWindow: "" }));
      return;
    }
    if (availableSlots.length === 0) {
      setPlan((prev) => ({ ...prev, deliveryWindow: "" }));
      return;
    }
    setPlan((prev) => {
      if (prev.deliveryWindow) {
        return prev;
      }
      return {
        ...prev,
        deliveryWindow: availableSlots[0],
      };
    });
  }, [availableSlots, selectedDriverId]);
  const isDriverSelectorDisabled =
    !canOrganize || driverLoading || drivers.length === 0;
  const isWindowInputDisabled =
    !canOrganize ||
    !selectedDriverId ||
    !plan.deliveryDate ||
    slotsLoading ||
    driverLoading;

  const runAction = async (action) => {
    setSaving(true);
    try {
      await action();
      await loadOrder();
      setIsUpdate(true);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartSorting = () => {
    if (!serviceId || !canOrganize) return;
    runAction(async () => {
      await OrderServices.startSorting(serviceId, {
        sorterId: currentUserId,
        notes: sortingNotes,
      });
      notifySuccess("Tri démarré !");
    });
  };

  const handleCompleteSorting = () => {
    if (!serviceId || !canOrganize) return;
    runAction(async () => {
      await OrderServices.completeSorting(serviceId, {
        notes: sortingNotes,
      });
      notifySuccess("Tri terminé !");
    });
  };

const handlePlanChange = (e) => {
  const { name, value } = e.target;
  if (name === "deliveryDate") {
    setWindowStart("");
    setWindowEnd("");
    setWindowError("");
  }
  setPlan((prev) => {
    const nextPlan = {
      ...prev,
      [name]: value,
    };
    if (name === "deliveryDate") {
      nextPlan.deliveryWindow = "";
    }
    return nextPlan;
  });
};

const handleDriverSelect = (e) => {
  const driverId = e.target.value;
  setSelectedDriverId(driverId);
  setWindowError("");
  if (!driverId) {
    setPlan((prev) => ({
      ...prev,
      assignedDriver: "",
      deliveryWindow: "",
    }));
    setWindowStart("");
    setWindowEnd("");
    setAvailableSlots([]);
    setTakenSlots([]);
    return;
  }
  const driver = drivers.find((d) => d.id === driverId);
  const label = formatDriverDisplay(driver);
  const storedValue = driver?.email ? `${label} (${driver.email})` : label;
  setPlan((prev) => ({
    ...prev,
    assignedDriver: storedValue,
    deliveryWindow: "",
  }));
  setWindowStart("");
  setWindowEnd("");
  setAvailableSlots([]);
  setTakenSlots([]);
};

  const handleSortingItemUpdate = (itemId, nextStatus) => {
    if (!serviceId || checklistDisabled) return;
    runAction(async () => {
      await OrderServices.updateSortingItem(serviceId, itemId, {
        status: nextStatus,
        checkerId: currentUserId,
      });
      notifySuccess(
        nextStatus === "Checked"
          ? "Produit confirmé."
          : "Produit marqué manquant."
      );
    });
  };

const handleDeliveryPlanSubmit = (e) => {
  e.preventDefault();
  if (!serviceId || !canOrganize) return;
  if (!selectedDriverId) {
    notifyError("S?lectionnez un livreur avant de planifier la livraison.");
    return;
  }
  if (!plan.deliveryDate) {
    notifyError("S?lectionnez une date de livraison.");
    return;
  }
  if (slotsLoading) {
    notifyError("Patientez pendant le chargement des cr?neaux.");
    return;
  }
  const windowCheck = validateWindowRange(windowStart, windowEnd);
  if (windowCheck.error) {
    setWindowError(windowCheck.error);
    notifyError(windowCheck.error);
    return;
  }
  const driverLabel =
    plan.assignedDriver || formatDriverDisplay(selectedDriver);
  const deliveryWindowValue = `${windowStart} - ${windowEnd}`;
  runAction(async () => {
    await OrderServices.updateDeliveryPlan(serviceId, {
      ...plan,
      deliveryWindow: deliveryWindowValue,
      assignedDriver: driverLabel,
      driverId: selectedDriverId,
      status: "Processing",
    });
    notifySuccess("Plan de livraison enregistr? !");
  });
};

  const renderInfoRow = (label, value) => (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 dark:text-gray-100">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Workflow des commandes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Démarrez le tri et planifiez la livraison pour chaque commande.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-300">
            Chargement des informations…
          </div>
        ) : !order ? (
          <div className="text-center text-gray-500 dark:text-gray-300">
            Sélectionnez une commande dans la liste pour commencer.
          </div>
        ) : (
          <>
            <section className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500 dark:text-gray-400">
                Synthèse commande
              </h3>
              {renderInfoRow("Facture", `#${order.invoice}`)}
              {renderInfoRow("Client", order?.user_info?.name)}
              {renderInfoRow(
                "Statut",
                order?.status || "Pending"
              )}
              {renderInfoRow(
                "Montant",
                `${order?.total?.toFixed
                  ? order.total.toFixed(2)
                  : order.total || 0} FCFA`
              )}
              {renderInfoRow(
                "Dernière mise à jour",
                order?.updatedAt ? showDateTimeFormat(order.updatedAt) : "—"
              )}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-1">
                <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  CoordonnÃ©es client
                </h4>
                {renderInfoRow("Contact", order?.user_info?.contact || "â€”")}
                {renderInfoRow("Email", order?.user_info?.email || "â€”")}
                {renderInfoRow(
                  "Ville / Pays",
                  [order?.user_info?.city, order?.user_info?.country]
                    .filter(Boolean)
                    .join(", ") || "â€”"
                )}
                {order?.user_info?.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Adresse : {order.user_info.address}
                    {order?.user_info?.zipCode
                      ? ` (${order.user_info.zipCode})`
                      : ""
                    }
                  </p>
                )}
              </div>
            </section>

            <section className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-base mb-1">
                  Étape 1 — Tri de la commande
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Le tri permet de vérifier les produits avant la préparation
                  de la livraison.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {renderInfoRow(
                  "Assigné à",
                  order?.sorting?.assignedTo ? "Trieur confirmé" : "Non assigné"
                )}
                {renderInfoRow("État du tri", sortingStatus)}
                {renderInfoRow(
                  "Début",
                  order?.sorting?.startedAt
                    ? showDateTimeFormat(order.sorting.startedAt)
                    : "—"
                )}
                {renderInfoRow(
                  "Fin",
                  order?.sorting?.completedAt
                    ? showDateTimeFormat(order.sorting.completedAt)
                    : "—"
                )}
              </div>

              <div>
                <Label className="text-sm mb-1">Notes internes</Label>
                <Textarea
                  rows="3"
                  value={sortingNotes}
                  onChange={(e) => setSortingNotes(e.target.value)}
                  disabled={!canOrganize}
                  placeholder="Observations, contraintes logistiques…"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Checklist produits
                </h4>
                {sortingItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lancez le tri pour générer la checklist des produits.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sortingItems.map((item) => {
                      const itemId = getItemId(item);
                      const orderDate = order?.createdAt
                        ? showDateTimeFormat(order.createdAt)
                        : "—";
                      const itemImage = getItemImage(item);
                      return (
                      <div
                        key={itemId}
                        className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            {itemImage && (
                              <img
                                src={itemImage}
                                alt={getItemName(item)}
                                className="w-14 h-14 rounded object-cover border border-gray-200 dark:border-gray-700"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-sm">
                                {getItemName(item)}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                <p>Qté : {item.quantity}</p>
                                <p>Client : {order?.user_info?.name || "—"}</p>
                                <p>Date commande : {orderDate}</p>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.status === "Checked"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "Missing"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getItemStatusLabel(item.status)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            className="flex-1 text-xs"
                            onClick={() =>
                              handleSortingItemUpdate(itemId, "Checked")
                            }
                            disabled={
                              checklistDisabled ||
                              saving ||
                              item.status === "Checked"
                            }
                          >
                            Marquer présent
                          </Button>
                          <Button
                            className="flex-1 text-xs"
                            layout="outline"
                            onClick={() =>
                              handleSortingItemUpdate(itemId, "Missing")
                            }
                            disabled={
                              checklistDisabled ||
                              saving ||
                              item.status === "Missing"
                            }
                          >
                            Marquer manquant
                          </Button>
                        </div>
                        {item.checkedAt && (
                          <p className="text-[11px] mt-2 text-gray-500 dark:text-gray-400">
                            Dernière mise à jour :{" "}
                            {showDateTimeFormat(item.checkedAt)}
                          </p>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                {sortingItems.length > 0 && !allItemsReviewed && (
                  <p className="text-xs text-amber-600 w-full">
                    Confirmez chaque produit avant de finaliser le tri.
                  </p>
                )}
                <Button
                  className="flex-1 min-w-[140px]"
                  onClick={handleStartSorting}
                  disabled={!canOrganize || !canStartSorting || saving}
                >
                  Démarrer le tri
                </Button>
                <Button
                  className="flex-1 min-w-[140px]"
                  layout="outline"
                  onClick={handleCompleteSorting}
                  disabled={!canOrganize || !canCompleteSorting || saving}
                >
                  Marquer comme trié
                </Button>
              </div>
            </section>

            {canPlanDelivery ? (
              <section className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div>
                  <h3 className="font-semibold text-base mb-1">
                    Étape 2 — Planification de la livraison
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Définissez les ressources de livraison après validation du tri.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleDeliveryPlanSubmit}>
                  <div>
                    <Label className="text-sm">Chauffeur / équipe</Label>
                    {driverLoading ? (
                      <p className="text-xs text-gray-500 mt-2">
                        Chargement des livreurs...
                      </p>
                    ) : (
                      <Select
                        name="assignedDriver"
                        value={selectedDriverId}
                        onChange={handleDriverSelect}
                        disabled={isDriverSelectorDisabled}
                        className="h-12"
                      >
                        <option value="">
                          Sélectionnez un livreur enregistré
                        </option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {formatDriverDisplay(driver)}
                            {driver.email ? ` (${driver.email})` : ""}
                          </option>
                        ))}
                      </Select>
                    )}
                    {driverError && (
                      <p className="text-xs text-red-600 mt-2">{driverError}</p>
                    )}
                    {!selectedDriverId && plan.assignedDriver && (
                      <p className="text-xs text-amber-600 mt-2">
                        Livreurs non synchronisés. Valeur actuelle :{" "}
                        {plan.assignedDriver}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Date de livraison</Label>
                      <Input
                        type="date"
                        name="deliveryDate"
                        value={plan.deliveryDate}
                        onChange={handlePlanChange}
                        disabled={!canOrganize}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Créneau horaire</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Heure de début
                          </p>
                          <Input
                            type="time"
                            value={windowStart}
                            onChange={handleWindowFieldChange("start")}
                            disabled={isWindowInputDisabled}
                            step="300"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Heure de fin
                          </p>
                          <Input
                            type="time"
                            value={windowEnd}
                            onChange={handleWindowFieldChange("end")}
                            disabled={isWindowInputDisabled}
                            step="300"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Créez des sessions flexibles (minimum {MIN_SLOT_DURATION_MINUTES} minutes).
                      </p>
                      {windowError && (
                        <p className="text-xs text-red-600 mt-1">
                          {windowError}
                        </p>
                      )}
                      {slotsLoading && (
                        <p className="text-xs text-gray-500 mt-1">
                          Chargement des créneaux disponibles...
                        </p>
                      )}
                      {slotsError && (
                        <p className="text-xs text-red-600 mt-1">
                          {slotsError}
                        </p>
                      )}
                      {selectedDriverId &&
                        baseDriverSlots.length === 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            Ce livreur n’a pas encore défini de disponibilités. Ajoutez des
                            créneaux via l’onglet Staff.
                          </p>
                        )}
                      {availableSlots.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Suggestions rapides
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => applySuggestedSlot(slot)}
                                disabled={isWindowInputDisabled}
                                className={`px-3 py-1 text-xs rounded-full border transition ${
                                  plan.deliveryWindow === slot
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {takenSlots.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Créneaux déjà réservés
                          </p>
                          <ul className="mt-1 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {takenSlots.map((slot) => (
                              <li key={`${slot.slot}-${slot.order || slot.startMinutes}`}>
                                {slot.slot}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Instructions</Label>
                    <Textarea
                      rows="3"
                      name="notes"
                      value={plan.notes}
                      onChange={handlePlanChange}
                      placeholder="Détails de livraison, points relais, etc."
                      disabled={!canOrganize}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !canOrganize ||
                      saving ||
                      slotsLoading ||
                      !windowStart ||
                      !windowEnd ||
                      Boolean(windowError)
                    }
                  >
                    Enregistrer le plan de livraison
                  </Button>
                </form>
              </section>
            ) : (
              <section className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                <h3 className="font-semibold text-base mb-1">
                  Étape 2 — Planification de la livraison
                </h3>
                Terminez d’abord le tri pour accéder à la planification de la
                livraison.
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderWorkflowDrawer;
