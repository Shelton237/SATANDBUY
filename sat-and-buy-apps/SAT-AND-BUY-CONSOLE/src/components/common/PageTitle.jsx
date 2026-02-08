import React from "react";
import { Helmet } from "react-helmet";

const PageTitle = ({ title, description }) => {
  return (
    <Helmet>
      <title>
        {" "}
        {title
          ? ` ${title} | Sat & Buy Console`
          : "Sat & Buy Console"}
      </title>
      <meta
        name="description"
        content={
          description
            ? ` ${description} `
            : "Sat & Buy Console – pilotage des ventes, stocks et catalogue."
        }
      />
    </Helmet>
  );
};

export default PageTitle;
