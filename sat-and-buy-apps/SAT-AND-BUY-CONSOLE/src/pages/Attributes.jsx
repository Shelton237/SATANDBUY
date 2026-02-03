import {
  Button,
  Card,
  CardBody,
  Table,
  TableCell,
  TableContainer,
  TableHeader,
} from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { FiChevronsRight } from "react-icons/fi";
import PageTitle from "@/components/Typography/PageTitle";
import { Link } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import AttributeServices from "@/services/AttributeServices";

const Attributes = () => {
  const { t } = useTranslation();

  const { data: counts, loading, error } = useAsync(AttributeServices.getCounts);

  const staticAttributes = [
    {
      id: 1,
      name: "Tailles",
      code: "sizes",
      displayName: "Tailles des produits",
      valuesCount: 5,
    },
    {
      id: 2,
      name: "Couleurs",
      code: "colors",
      displayName: "Couleurs des produits",
      valuesCount: 8,
    },
    {
      id: 3,
      name: "Marques",
      code: "brands",
      displayName: "Marques des produits",
      valuesCount: 12,
    },
  ];

  return (
    <>
      <PageTitle>{t("AttributeTitle")}</PageTitle>

      <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>{t("Nom")}</TableCell>
                  <TableCell>{t("Valeurs")}</TableCell>
                  <TableCell className="text-right">{t("Actions")}</TableCell>
                </tr>
              </TableHeader>
              <tbody className="bg-white divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800">
                {staticAttributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div className="font-medium text-gray-700 dark:text-gray-200">
                        {attr.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {attr.displayName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {counts[attr.code] || 0} valeurs
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Link
                          to={`/attributes/${attr.code}`}
                          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-500"
                        >
                          <FiChevronsRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </>
  );
};

export default Attributes;
