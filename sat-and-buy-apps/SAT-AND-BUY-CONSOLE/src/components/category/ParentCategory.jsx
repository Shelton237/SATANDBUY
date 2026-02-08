import Multiselect from "multiselect-react-dropdown";
import Tree from "rc-tree";

//internal import
import useAsync from "@/hooks/useAsync";
import { notifySuccess } from "@/utils/toast";
import CategoryServices from "@/services/products/CategoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const ParentCategory = ({
  selectedCategory,
  setSelectedCategory,
  setDefaultCategory,
}) => {
  const { data, loading } = useAsync(CategoryServices?.getAllCategory);
  const { showingTranslateValue } = useUtilsFunction();
  const getCategoryId = (category) => category?.id || category?._id;

  const STYLE = `
  .rc-tree-child-tree {
    display: block;
  }
  .node-motion {
    transition: all .3s;
    overflow-y: hidden;
  }
`;

  const motion = {
    motionName: "node-motion",
    motionAppear: false,
    onAppearStart: (node) => {
      return { height: 0 };
    },
    onAppearActive: (node) => ({ height: node.scrollHeight }),
    onLeaveStart: (node) => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
  };

  const renderCategories = (categories) => {
    let myCategories = [];
    for (let category of categories) {
      myCategories.push({
        title: showingTranslateValue(category.name),
        key: getCategoryId(category),
        children:
          category?.children?.length > 0 && renderCategories(category.children),
      });
    }

    return myCategories;
  };

  const findObject = (obj, target) => {
    return getCategoryId(obj) === target
      ? obj
      : obj?.children?.reduce(
          (acc, obj) => acc ?? findObject(obj, target),
          undefined
        );
    // if (obj._id === target) return obj;

    // for (let c of obj.children) {
    //   let x = findObject(target, c);
    //   console.log('c', c);
    //   if (x) return x;
    // }
  };

  const handleSelect = (key) => {
    const obj = data[0];
    const result = findObject(obj, key);

    if (result !== undefined) {
      const getCategory = selectedCategory.filter(
        (value) => value.id === getCategoryId(result)
      );

      if (getCategory.length !== 0) {
        return notifySuccess("This category already selected!");
      }

      setSelectedCategory((pre) => [
        ...pre,
        {
          id: getCategoryId(result),
          name: showingTranslateValue(result?.name),
        },
      ]);
      setDefaultCategory(() => [
        {
          id: getCategoryId(result),
          name: showingTranslateValue(result?.name),
        },
      ]);
    }
  };

  const handleRemove = (v) => {
    setSelectedCategory(v);
  };

  return (
    <>
      <div className="mb-2">
        <Multiselect
          displayValue="name"
          groupBy="name"
          isObject={true}
          hidePlaceholder={true}
          onKeyPressFn={function noRefCheck() {}}
          onRemove={(v) => handleRemove(v)}
          onSearch={function noRefCheck() {}}
          onSelect={(v) => handleSelect(v)}
          // options={selectedCategory}
          selectedValues={selectedCategory}
          placeholder={"Select Category"}
        ></Multiselect>
      </div>

      {!loading && data !== undefined && (
        <div className="draggable-demo capitalize">
          <style dangerouslySetInnerHTML={{ __html: STYLE }} />
          <Tree
            expandAction="click"
            treeData={renderCategories(data)}
            // defaultCheckedKeys={id}
            onSelect={(v) => handleSelect(v[0])}
            motion={motion}
            animation="slide-up"
          />
        </div>
      )}
    </>
  );
};

export default ParentCategory;
