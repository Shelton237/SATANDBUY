import { useEffect, useMemo, useState } from "react";
import Dashboard from "@pages/user/dashboard";
import ProductServices from "@services/ProductServices";
import MarketListServices from "@services/MarketListServices";
import { notifyError, notifySuccess } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MarketListPage = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [expandedMarketListId, setExpandedMarketListId] = useState(null);

  const [productQuery, setProductQuery] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [desiredPrice, setDesiredPrice] = useState("");
  const [listItems, setListItems] = useState([]);
  const [listName, setListName] = useState("");
  const [listNote, setListNote] = useState("");

  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const handleCloseDrawer = () => {
    closeDrawer();
    setEditingList(null);
    resetForm();
  };

  const totalListValue = useMemo(
    () =>
      listItems.reduce(
        (acc, item) => acc + (item.desiredPrice || 0) * item.quantity,
        0
      ),
    [listItems]
  );

  const resetForm = () => {
    setListItems([]);
    setListName("");
    setListNote("");
    setQuantity(1);
    setDesiredPrice("");
    setSelectedProductId("");
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await ProductServices.getShowingStoreProducts({
        title: productQuery,
      });
      setAvailableProducts(response.products || []);
      setProductError("");
    } catch (err) {
      setProductError(err?.message || "Impossible de charger les produits.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchLists = async () => {
    setListsLoading(true);
    try {
      const response = await MarketListServices.find();
      setLists(Array.isArray(response) ? response : response.lists || []);
      setListsError("");
    } catch (err) {
      setListsError(err?.message || "Impossible de charger vos listes.");
    } finally {
      setListsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLists();
  }, []);

  const currentProduct = useMemo(
    () => availableProducts.find((product) => product._id === selectedProductId),
    [selectedProductId, availableProducts]
  );

  const handleAddItem = () => {
    if (!selectedProductId) {
      notifyError("Sélectionnez un produit à ajouter.");
      return;
    }
    const qty = Number(quantity) || 0;
    if (qty < 1) {
      notifyError("Saisissez une quantité valide (>= 1).");
      return;
    }
    const basePrice =
      Number(currentProduct?.prices?.price) ||
      Number(currentProduct?.variants?.[0]?.price) ||
      0;
    const priceValue =
      desiredPrice !== ""
        ? Number(desiredPrice) >= 0
          ? Number(desiredPrice)
          : basePrice
        : basePrice;

    const existingIndex = listItems.findIndex(
      (item) => item.productId === selectedProductId
    );
    if (existingIndex !== -1) {
      const updatedItems = [...listItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + qty,
        desiredPrice: priceValue,
      };
      setListItems(updatedItems);
    } else {
      setListItems([
        ...listItems,
        {
          productId: selectedProductId,
          productTitle:
            currentProduct?.title?.en ||
            currentProduct?.title?.fr ||
            currentProduct?.name ||
            "Produit",
          quantity: qty,
          desiredPrice: priceValue,
        },
      ]);
    }
    setQuantity(1);
    setDesiredPrice("");
  };

  const handlePrepareNewList = () => {
    resetForm();
    setEditingList(null);
    openDrawer();
  };

  const handleRemoveItem = (productId) => {
    setListItems(listItems.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!listItems.length) {
      notifyError("Ajoutez au moins un produit à votre liste.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: listName || "Liste de marché",
        note: listNote,
        items: listItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          desiredPrice: item.desiredPrice,
        })),
      };

      if (editingList) {
        await MarketListServices.update(editingList._id, payload);
        notifySuccess("Liste mise à jour pour validation.");
      } else {
        await MarketListServices.create(payload);
        notifySuccess("Liste envoyée pour validation.");
      }

      resetForm();
      setEditingList(null);
      fetchLists();
      handleCloseDrawer();
    } catch (err) {
      notifyError(err?.message || "Impossible d’envoyer la liste.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setListName(list.name || "");
    setListNote(list.note || "");
    const items = Array.isArray(list.items) ? list.items : [];
    setListItems(
      items.map((item) => ({
        productId:
          item.product?.toString?.() ||
          item.productId ||
          item.product?._id?.toString?.() ||
          "",
        productTitle:
          item.productTitle ||
          item.product?.title?.fr ||
          item.product?.title?.en ||
          "Produit",
        quantity: item.quantity || 1,
        desiredPrice:
          typeof item.desiredPrice === "number"
            ? item.desiredPrice
            : Number(item.desiredPrice) || 0,
      }))
    );
    openDrawer();
  };

  const handleToggleListDetails = (listId) => {
    setExpandedMarketListId((prev) => (prev === listId ? null : listId));
  };

  const renderFormContent = () => (
    <>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Produit</label>
          <div className="flex gap-2 mt-1">
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Rechercher un produit"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={fetchProducts}
              className="px-3 h-10 border rounded bg-emerald-500 text-white text-sm"
            >
              Rechercher
            </button>
          </div>
          <select
            className="w-full border rounded mt-2 px-3 py-2 text-sm"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            disabled={loadingProducts}
          >
            <option value="">
              {loadingProducts ? "Chargement…" : "Choisissez un produit"}
            </option>
            {availableProducts.map((product) => (
              <option key={product._id} value={product._id}>
                {product.title?.en ||
                  product.title?.fr ||
                  product.name ||
                  "Produit"}
              </option>
            ))}
          </select>
          {productError && (
            <p className="text-xs text-red-600 mt-1">{productError}</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Quantité</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="w-full border rounded mt-1 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Prix souhaité (FCFA)</label>
            <input
              type="number"
              min="0"
              value={desiredPrice}
              onChange={(event) => setDesiredPrice(event.target.value)}
              className="w-full border rounded mt-1 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Ajouter à la liste
        </button>

        {listItems.length > 0 && (
          <div className="border rounded p-4 space-y-3">
            {listItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center text-sm justify-between"
              >
                <span className="w-1/3">{item.productTitle}</span>
                <span className="w-1/4 text-center">{item.quantity}</span>
                <span className="w-1/4 text-center">
                  {item.desiredPrice.toLocaleString("fr-FR")} FCFA
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.productId)}
                  className="text-red-600 text-xs"
                >
                  Retirer
                </button>
              </div>
            ))}
            <div className="flex justify-end text-sm font-semibold">
              Total : {totalListValue.toLocaleString("fr-FR")} FCFA
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Intitulé de la liste"
            value={listName}
            onChange={(event) => setListName(event.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Commentaires ou contraintes"
            value={listNote}
            onChange={(event) => setListNote(event.target.value)}
            className="border rounded px-3 py-2 text-sm h-24"
          />
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="px-4 py-2 bg-emerald-600 text-white rounded text-sm"
        >
          {submitting
            ? "Envoi en cours…"
            : editingList
            ? "Mettre à jour pour validation"
            : "Soumettre pour validation"}
        </button>
      </div>
    </>
  );

  return (
    <Dashboard
      title={
        showingTranslateValue(
          storeCustomizationSetting?.dashboard?.shopping_list
        ) || "Liste de marché"
      }
    >
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {showingTranslateValue(
              storeCustomizationSetting?.dashboard?.shopping_list
            ) || "Liste de marché"}
          </h2>
          <button
            type="button"
            onClick={handlePrepareNewList}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
          >
            Préparer une nouvelle liste
          </button>
        </div>

        <section className="bg-white rounded shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">
              Historique des listes
            </h3>
            <span className="text-xs uppercase text-gray-500">
              {lists.length} trouvée(s)
            </span>
          </div>
          {listsLoading ? (
            <p>Chargement…</p>
          ) : listsError ? (
            <p className="text-sm text-red-600">{listsError}</p>
          ) : !lists.length ? (
            <p className="text-sm text-gray-500">Aucune liste soumise.</p>
          ) : (
            <div className="space-y-3">
              {lists.map((list) => (
                <div
                  key={list._id}
                  className="border rounded p-3 bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{list.name}</span>
                    <span className="text-xs uppercase text-emerald-600">
                      {list.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {list.note || "Sans commentaire."}
                  </p>
                  <div className="grid grid-cols-3 text-xs gap-2 text-gray-600">
                    <div>
                      <p className="font-semibold">Articles</p>
                      <p>{list.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Montant</p>
                      <p>{list.totalValue?.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <div>
                      <p className="font-semibold">Créée le</p>
                      <p>
                        {new Date(list.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleListDetails(list._id)}
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      {expandedMarketListId === list._id
                        ? "Masquer les produits"
                        : "Voir les produits demandés"}
                    </button>
                    {list.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleEditList(list)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Modifier la liste
                      </button>
                    )}
                  </div>
                  {expandedMarketListId === list._id && (
                    <div className="space-y-2 text-xs text-gray-600 border-t pt-2">
                      {list.items?.length ? (
                        list.items.map((item, index) => (
                          <div
                            key={`${list._id}-item-${index}`}
                            className="flex flex-wrap gap-2"
                          >
                            <span className="w-full md:w-1/2 font-semibold">
                              {item.productTitle || "Produit"}
                            </span>
                            <span className="w-1/6 text-center">
                              Qte: {item.quantity}
                            </span>
                            <span className="w-1/6 text-center">
                              Prix:{" "}
                              {item.desiredPrice?.toLocaleString("fr-FR") || "0"}{" "}
                              FCFA
                            </span>
                          </div>
                        ))
                      ) : (
                        <p>Aucun article détaillé.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={handleCloseDrawer}
          ></div>
          <div className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-lg font-semibold">
                {editingList ? "Modifier la liste" : "Liste de marché"}
              </h3>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="text-xs text-gray-500"
              >
                Fermer
              </button>
            </div>
            <div className="px-6 py-5">{renderFormContent()}</div>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default MarketListPage;
