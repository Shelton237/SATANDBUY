import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";

const useToggleDrawer = () => {
  const {
    serviceId,
    setServiceId,
    allId,
    setAllId,
    title,
    setTitle,
    toggleDrawer,
    toggleModal,
    toggleBulkDrawer,
  } = useContext(SidebarContext);

  const handleUpdate = (id) => {
    setServiceId(id);
    toggleDrawer();
  };

  const handleUpdateMany = (ids) => {
    setAllId(ids);
    toggleBulkDrawer();
  };

  const handleModalOpen = (id, modalTitle) => {
    setServiceId(id);
    setTitle(modalTitle);
    toggleModal();
  };

  const handleDeleteMany = (ids, label = "Selected Products") => {
    setAllId(ids);
    setTitle(label);
    toggleModal();
  };

  return {
    title,
    allId,
    serviceId,
    handleUpdate,
    setServiceId,
    handleModalOpen,
    handleDeleteMany,
    handleUpdateMany,
  };
};

export default useToggleDrawer;