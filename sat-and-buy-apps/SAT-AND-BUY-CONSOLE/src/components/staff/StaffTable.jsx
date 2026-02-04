// components/staff/StaffTable.js
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import React from "react";

import Status from "@/components/table/Status";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ActiveInActiveButton from "@/components/table/ActiveInActiveButton";

const StaffTable = ({ staffs, lang }) => {
  const {
    title,
    serviceId,
    handleModalOpen,
    handleUpdate,
  } = useToggleDrawer();
  const { showDateFormat } = useUtilsFunction();

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      <TableBody>
        {staffs?.map((user) => {
          const firstName = user.firstName || "";
          const lastName = user.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || user.username;
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center">
                    <h2 className="text-sm font-medium">
                      { fullName || "-"} 
                    </h2>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm">{user.email || "-"}</span>
              </TableCell>

              <TableCell>
                <span className="text-sm">{user.phone || "N/A"}</span>
              </TableCell>

              <TableCell>
                <span className="text-sm">
                  {showDateFormat(user.joiningDate || user.createdTimestamp)}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-white text-xs rounded-full font-semibold"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold">User</span>
                  )}
                </div>
              </TableCell>


              <TableCell className="text-center text-xs">
                <Status status={user.status || (user.enabled ? "Active" : "Inactive")} />
              </TableCell>

              <TableCell className="text-center">
                <ActiveInActiveButton
                  id={user.id}
                  staff={user}
                  option="staff"
                  status={user.status || (user.enabled ? "Active" : "Inactive")}
                />
              </TableCell>

              <TableCell>
                <EditDeleteButton
                  id={user.id}
                  staff={user}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                  title={fullName}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );
};

export default StaffTable;
