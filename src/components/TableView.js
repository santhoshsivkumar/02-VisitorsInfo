// src/TableView.js
import React from "react";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import LoadingComponent from "./LoadingComponent";

const TableView = ({
  columns,
  loading,
  currentItems,
  startingID,
  fillEmptyRows,
  sortConfig,
  onSort,
  expandedId,
  onExpand,
}) => {
  return (
    <table className="table-auto rounded-[0.3rem] w-full border-gray-300">
      <TableHeader columns={columns} sortConfig={sortConfig} onSort={onSort} />
      {loading ? (
        <LoadingComponent columns={columns}>Loading...</LoadingComponent>
      ) : currentItems.length ? (
        <TableBody
          currentItems={currentItems}
          columns={columns}
          startingID={startingID}
          fillEmptyRows={fillEmptyRows}
          expandedId={expandedId}
          onExpand={onExpand}
        />
      ) : (
        <LoadingComponent columns={columns}>No data found</LoadingComponent>
      )}
    </table>
  );
};

export default TableView;
