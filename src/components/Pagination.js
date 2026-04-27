import React from "react";
import { motion } from "framer-motion";

const Pagination = ({ totalItems, itemsPerPage, currentPage, paginate }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const go = (page) => {
    if (page < 1 || page > totalPages) return;
    paginate(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build windowed page list: always show first, last, current ±2, with ellipsis gaps
  const buildPages = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    return [1, ...range, totalPages];
  };

  const pages = totalPages === 1 ? [1] : buildPages();

  const btnBase = "px-3 py-1 rounded-md transform transition-all select-none";
  const activeBtn = `${btnBase} bg-gray-200 text-gray-800 scale-110 font-bold`;
  const inactiveBtn = `${btnBase} bg-gray-800 text-white hover:scale-105`;
  const arrowBtn = `${btnBase} bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className="flex justify-center mt-4">
      <ul className="flex flex-wrap justify-center gap-1">
        {/* Prev */}
        <li>
          <button
            onClick={() => go(currentPage - 1)}
            disabled={currentPage === 1}
            className={arrowBtn}
          >
            &#8249;
          </button>
        </li>

        {pages.map((page, idx) =>
          page === "..." ? (
            <li key={`ellipsis-${idx}`}>
              <span className="px-2 py-1 text-gray-400 select-none">
                &hellip;
              </span>
            </li>
          ) : (
            <motion.li
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => go(page)}
                className={currentPage === page ? activeBtn : inactiveBtn}
              >
                {page}
              </button>
            </motion.li>
          ),
        )}

        {/* Next */}
        <li>
          <button
            onClick={() => go(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={arrowBtn}
          >
            &#8250;
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
