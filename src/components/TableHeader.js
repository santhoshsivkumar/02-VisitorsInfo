// src/TableHeader.js
import React from "react";

const TableHeader = ({ columns, sortConfig, onSort }) => (
  <thead>
    <tr className="bg-green-800 border border-gray-300">
      {columns.map((col, index) => (
        <th
          key={index}
          className={`px-4 py-2 text-white font-bold select-none ${
            col.sortKey ? "cursor-pointer hover:bg-green-700" : ""
          }`}
          style={{ width: "150px" }}
          onClick={() => col.sortKey && onSort(col.sortKey)}
        >
          <span className="flex items-center justify-center gap-1">
            {col.header}
            {col.sortKey && (
              <span className="text-xs opacity-70">
                {sortConfig?.key === col.sortKey
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "↕"}
              </span>
            )}
          </span>
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
