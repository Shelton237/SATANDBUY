import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";

import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import useStaffRoles from "@/hooks/useStaffRoles";
import MainDrawer from "@/components/drawer/MainDrawer";
import StaffDrawer from "@/components/drawer/StaffDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import StaffTable from "@/components/staff/StaffTable";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import UserService from "@/services/UserService";
import AnimatedContent from "@/components/common/AnimatedContent";

const Staff = () => {
  const { t } = useTranslation();
  const { toggleDrawer, lang, setIsUpdate, serviceId } = useContext(SidebarContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const { roles, loading: rolesLoading, error: rolesError } = useStaffRoles();

  const fetchUsers = useCallback(async () => {
    const users = await UserService.getAllUsers();
    return users.map(user => ({
      ...user,
      phone: user.phone || null,
      image: user.image || null,
    }));
  }, []);

  const { data, loading, error } = useAsync(fetchUsers);

  const handleUserAdded = useCallback(() => {
    setIsUpdate(true);
  }, [setIsUpdate]);

  const handleUserUpdated = useCallback(() => {
    setIsUpdate(true);
  }, [setIsUpdate]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    return data.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !selectedRole || selectedRole === "All" || user.roles.includes(selectedRole);
      return matchesSearch && matchesRole;
    });
  }, [data, searchQuery, selectedRole]);

  const {
    userRef,
    setRole,
    totalResults,
    resultsPerPage,
    dataTable,
    serviceData,
    handleChangePage,
    handleSubmitUser,
  } = useFilter(filteredUsers);

  const handleResetField = useCallback(() => {
    setSelectedRole("");
    setSearchQuery("");
  }, []);

  const renderTable = useMemo(() => {
    if (loading) return <TableLoading row={12} col={7} width={163} height={20} />;
    if (error) return <span className="text-center mx-auto text-red-500">{error}</span>;
    if (serviceData?.length === 0) return <NotFound title="Sorry, There are no staff right now." />;
    return (
      <TableContainer className="mb-8 rounded-b-lg">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>{t("StaffNameTbl")}</TableCell>
              <TableCell>{t("StaffEmailTbl")}</TableCell>
              <TableCell>{t("StaffContactTbl")}</TableCell>
              <TableCell>{t("StaffJoiningDateTbl")}</TableCell>
              <TableCell>{t("StaffRoleTbl")}</TableCell>
              <TableCell className="text-center">{t("OderStatusTbl")}</TableCell>
              <TableCell className="text-center">{t("PublishedTbl")}</TableCell>
              <TableCell className="text-right">{t("StaffActionsTbl")}</TableCell>
            </tr>
          </TableHeader>
          <StaffTable staffs={dataTable} lang={lang} />
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onChange={handleChangePage}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    );
  }, [loading, error, serviceData, t, dataTable, lang, totalResults, resultsPerPage, handleChangePage]);

  return (
    <>
      <PageTitle>{t("StaffPageTitle")}</PageTitle>

      <MainDrawer>
        {rolesLoading ? (
          <div className="p-4 text-center">
            <p>Chargement des rôles...</p>
          </div>
        ) : roles.length > 0 ? (
          <StaffDrawer
            roles={roles}
            staffId={serviceId}
            onUserAdded={handleUserAdded}
            onUserUpdated={handleUserUpdated}
          />
        ) : (
          <div className="p-4 text-center text-red-500">
            <p>Aucun rôle récupéré</p>
          </div>
        )}
      </MainDrawer>


      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form onSubmit={handleSubmitUser} className="py-3 grid gap-4 lg:gap-6 xl:gap-6 md:flex xl:flex">
              <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <Input
                  type="search"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("StaffSearchBy")}
                />
              </div>
              <div className="flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="" disabled hidden>{t("StaffRole")}</option>
                  <option value="All">{t("All")}</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </Select>
              </div>
              <div className="w-full md:w-56 lg:w-56 xl:w-56">
                <Button onClick={toggleDrawer} className="w-full rounded-md h-12">
                  <span className="mr-3"><FiPlus /></span>{t("AddStaff")}
                </Button>
              </div>
              <div className="mt-2 md:mt-0 flex items-center xl:gap-x-4 gap-x-1 flex-grow-0 md:flex-grow lg:flex-grow xl:flex-grow">
                <div className="w-full mx-1">
                  <Button type="submit" className="h-12 w-full bg-emerald-700">{t("Filter")}</Button>
                </div>
                <div className="w-full">
                  <Button layout="outline" onClick={handleResetField} type="reset" className="px-4 md:py-1 py-3 text-sm dark:bg-gray-700">
                    <span className="text-black dark:text-gray-200">{t("Reset")}</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </AnimatedContent>

      {renderTable}
    </>
  );
};

export default Staff;


