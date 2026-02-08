import React, { useEffect, useMemo, useCallback } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";
import Tree from "rc-tree";

// Components
import { notifyError } from "@/utils/toast";
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import DrawerButton from "@/components/form/button/DrawerButton";
import Loading from "@/components/preloader/Loading";
import { Select } from "@windmill/react-ui";

// Hooks & Services
import useCategorySubmit from "@/hooks/useCategorySubmit";
import CategoryServices from "@/services/products/CategoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const TREE_STYLE = `
  .rc-tree-child-tree { display: block; }
  .node-motion {
    transition: all .3s;
    overflow-y: hidden;
  }
  .rc-tree-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rc-tree-node-content-wrapper { width: 100%; }
`;

const TREE_MOTION = {
  motionName: "node-motion",
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: (node) => ({ height: node.scrollHeight }),
  onLeaveStart: (node) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' }
];

const CategoryDrawer = ({ id, data, onClose, refetch }) => {
  const { t } = useTranslation();
  const { showingTranslateValue } = useUtilsFunction();

  const {
    checked,
    register,
    onSubmit,
    handleSubmit,
    errors,
    imageUrl,
    setImageUrl,
    published,
    setPublished,
    setChecked,
    selectCategoryName,
    setSelectCategoryName,
    handleSelectLanguage,
    translations,
    handleInputChange,
    language,
    isSubmitting,
    resetForm,
    status,
    setStatus,
  } = useCategorySubmit(id, data);


  const findCategory = useCallback((obj, target) => {
    return obj.id === target
      ? obj
      : obj?.children?.reduce((acc, obj) => acc ?? findCategory(obj, target), undefined);
  }, []);

  const handleSelectCategory = useCallback(async (key) => {
    if (!key) return;

    if (id) {
      const parentCategory = await CategoryServices.getById(key);
      if (id === key || id === parentCategory.parentId) {
        notifyError(t("CannotSelectParent"));
        return;
      }
    }

    setChecked(key);
    const result = findCategory(data[0], key);
    setSelectCategoryName(showingTranslateValue(result?.name));
  }, [id, data, findCategory, showingTranslateValue, setChecked, setSelectCategoryName, t]);

  const handleStatusToggle = useCallback((val) => {
    setPublished(val);
    setStatus(val ? "ACTIVE" : "INACTIVE");
  }, [setPublished, setStatus]);

  const handleFormSubmission = useCallback(async () => {
    try {
      const payload = {
        name: translations.name,
        type: translations.type,
        status,
        icon: imageUrl,
        ...(checked && { parentId: Number(checked) }),
      };

      await onSubmit(payload);
      refetch?.();
      onClose?.();
    } catch (error) {
      notifyError(error.message);
    }
  }, [translations, status, imageUrl, checked, onSubmit, id, t, refetch, onClose]);

  const flattenTreeData = (treeNodes) => {
    let result = [];
    treeNodes.forEach((node) => {
      result.push(node);
      if (node.children) {
        result = result.concat(flattenTreeData(node.children));
      }
    });
    return result;
  };


  const formatTreeData = (flatCategories) => {
    // 1. Créer un dictionnaire et détecter les parents
    const categoriesDict = {};
    const hasChildren = {};

    flatCategories.forEach(category => {
      categoriesDict[category.id] = {
        ...category,
        children: []
      };

      // Initialiser le statut "a des enfants"
      hasChildren[category.id] = false;
    });

    // 2. Construire la hiérarchie et marquer les parents
    const tree = [];
    flatCategories.forEach(category => {
      if (category.parentId && categoriesDict[category.parentId]) {
        categoriesDict[category.parentId].children.push(categoriesDict[category.id]);
        hasChildren[category.parentId] = true; // Marquer le parent comme ayant des enfants
      } else {
        tree.push(categoriesDict[category.id]);
      }
    });

    // 3. Trier les enfants pour mettre les dossiers en premier
    const sortNodes = (nodes) => {
      return nodes
        .map(node => ({
          ...node,
          children: sortNodes(node.children) // Trier récursivement
        }))
        .sort((a, b) => {
          // D'abord par statut "a des enfants" (dossiers d'abord)
          if (hasChildren[a.id] && !hasChildren[b.id]) return -1;
          if (!hasChildren[a.id] && hasChildren[b.id]) return 1;

          // Ensuite par nom
          return showingTranslateValue(a.name).localeCompare(showingTranslateValue(b.name));
        });
    };

    // 4. Formater pour rc-tree après tri
    const formatNode = (node) => ({
      key: node.id,
      title: (
        <span className="flex items-center">
          {showingTranslateValue(node.name)}
        </span>
      ),
      children: node.children.map(formatNode),
      isLeaf: !hasChildren[node.id],
      className: hasChildren[node.id] ? 'folder-node' : 'file-node'
    });

    return sortNodes(tree).map(formatNode);
  };

  // Utilisation dans le composant
  const treeData = useMemo(() => formatTreeData(data), [data, showingTranslateValue]);

  useEffect(() => {
    if (id && data) {
      const category = data.find(cat => cat.id === id);
      if (category) {
        setStatus(category.status || "ACTIVE");
        setPublished(category.status === "ACTIVE");
        setImageUrl(category.icon || "");

        if (category.parentId) {
          const parentKey = category.parentId?.toString();
          setChecked(parentKey);
          const parent = findCategory(data[0], parentKey);
          setSelectCategoryName(
            parent ? showingTranslateValue(parent?.name) : t("RootCategory")
          );
        }
        else {
          setChecked(null);
          setSelectCategoryName(t("RootCategory"));
        }
      }
    }
    else {
      resetForm();
    }
  }, [id, data, setChecked, setSelectCategoryName, setStatus, setPublished]);

  console.log("Selected parent name:", selectCategoryName);
  if (!data) return <Loading />;

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          title={id ? t("UpdateCategory") : t("AddCategoryTitle")}
          description={id ? t("UpdateCategoryDescription") : t("AddCategoryDescription")}
        />
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(handleFormSubmission)}>
          <div className="p-6 flex-grow scrollbar-hide w-full max-h-full pb-40">
            {/* Language Selection */}
            <div className="grid grid-cols-6 gap-3 mb-6">
              <LabelArea label={t("Language")} />
              <div className="col-span-8 sm:col-span-4">
                <div className="flex space-x-2">
                  {LANGUAGES.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSelectLanguage(code)}
                      className={`px-3 py-1 rounded-md ${language === code
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                        }`}
                    >
                      {t(label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <InputSection
              label={`${t("Name")} (${language})`}
              component={
                <InputArea
                  required
                  name="name"
                  value={translations.name[language] || ""}
                  onChange={(e) => handleInputChange("name", language, e.target.value)}
                  placeholder={t("CategoryNamePlaceholder")}
                />
              }
              error={errors.name}
            />

            {/* Type Input */}
            <InputSection
              label={`${t("Type")} (${language})`}
              component={
                <InputArea
                  required
                  name="type"
                  value={translations.type[language] || ""}
                  onChange={(e) => handleInputChange("type", language, e.target.value)}
                  placeholder={t("CategoryTypePlaceholder")}
                />
              }
            />

            {/* Parent Category Selection */}
            <div className="grid grid-cols-6 gap-3 mb-6">
              <LabelArea label={t("ParentCategory")} />
              <div className="col-span-8 sm:col-span-4 relative">
                {/* Champ d'affichage de la catégorie sélectionnée */}
                <InputArea
                  readOnly
                  name="parent"
                  value={selectCategoryName || t("RootCategory")}
                  placeholder={t("ParentCategory")}
                  type="text"
                  className="mb-4"
                />

                {/* Arborescence des catégories */}
                <Tree
                  expandAction="click"
                  treeData={treeData}
                  selectedKeys={checked ? [checked] : []}
                  onSelect={(selectedKeys) => {
                    if (selectedKeys.length > 0) {
                      handleSelectCategory(selectedKeys[0]);
                    }
                  }}
                  motion={TREE_MOTION}
                  animation="slide-up"
                  defaultExpandAll={false}
                  defaultExpandedKeys={checked ? [checked] : []}
                />

                {/* Bouton pour annuler la sélection */}
                {checked && (
                  <button
                    type="button"
                    className="text-sm text-blue-500 mt-2 hover:text-blue-700"
                    onClick={() => {
                      setChecked(null);
                      setSelectCategoryName(t("RootCategory"));
                    }}
                  >
                    {t("NoParentCategory")}
                  </button>
                )}
              </div>
            </div>

            {/* Icon Selector */}
            <div className="grid grid-cols-6 gap-3 mb-6">
              <LabelArea label={t("Icon")} />
              <div className="col-span-8 sm:col-span-4 flex items-center gap-3">
                <Select
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                  value={imageUrl || ""}
                  onChange={(e) => setImageUrl(e.target.value)}
                >
                  <option value="">{t("SelectIcon")}</option>
                  <option value="fa-boxes">{t("Boxes")} (fa-boxes)</option>
                  <option value="fa-shopping-cart">{t("Cart")} (fa-shopping-cart)</option>
                  <option value="fa-tags">{t("Tags")} (fa-tags)</option>
                  <option value="fa-list">{t("List")} (fa-list)</option>
                  <option value="fa-layer-group">{t("Layers")} (fa-layer-group)</option>
                  <option value="fa-folder">{t("Folder")} (fa-folder)</option>
                  <option value="fa-cube">{t("Cube")} (fa-cube)</option>
                  <option value="fa-archive">{t("Archive")} (fa-archive)</option>
                </Select>
                {imageUrl && (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500">
                    <i className={`fas ${imageUrl} text-white text-lg`} />
                  </span>
                )}
              </div>
            </div>

            {/* Status Toggle */}
            <div className="grid grid-cols-6 gap-3 mb-6">
              <LabelArea label={t("Status")} />
              <div className="col-span-8 sm:col-span-4 flex items-center">
                <SwitchToggle
                  handleProcess={handleStatusToggle}
                  processOption={published}
                />
                <span className="ml-2 text-sm">
                  {published ? t("Active") : t("Inactive")}
                </span>
              </div>
            </div>
          </div>

          <DrawerButton
            id={id}
            title="Category"
            isSubmitting={isSubmitting}
            onClose={onClose}
            onReset={resetForm}
          />
        </form>
      </Scrollbars>
    </>
  );
};

// Helper component for consistent input sections
const InputSection = ({ label, component, error }) => (
  <div className="grid grid-cols-6 gap-3 mb-6">
    <LabelArea label={label} />
    <div className="col-span-8 sm:col-span-4">
      {component}
      {error && <Error errorName={error} />}
    </div>
  </div>
);

export default CategoryDrawer;
