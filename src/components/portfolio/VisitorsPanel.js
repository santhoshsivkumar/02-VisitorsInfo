// src/components/portfolio/VisitorsPanel.js
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { parseUserAgent } from "../../utils/parseUserAgent";
import Pagination from "../Pagination";

const SORT_KEYS = [
  { label: "Date", key: "timestamp" },
  { label: "City", key: "city" },
  { label: "Country", key: "country_name" },
  { label: "Auth", key: "authMethod" },
];

const ITEMS_PER_PAGE = 10;

const VisitorRow = ({ visitor, index }) => {
  const { browser, os, deviceType } = visitor.userAgent
    ? parseUserAgent(visitor.userAgent)
    : {};

  const mapUrl =
    visitor.latitude && visitor.longitude
      ? `https://www.google.com/maps?q=${visitor.latitude},${visitor.longitude}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-[#1a2028] border border-gray-700/40 rounded-xl p-4 hover:border-gray-600/60 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {visitor.googlePhotoUrl ? (
          <img
            src={visitor.googlePhotoUrl}
            alt={visitor.googleName || "visitor"}
            className="w-10 h-10 rounded-full border-2 border-green-600 flex-shrink-0 mt-0.5"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-800 to-teal-800 flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-gray-600 mt-0.5">
            {(visitor.googleName || visitor.ip || "?")[0].toUpperCase()}
          </div>
        )}

        {/* Main info */}
        <div className="flex-1 min-w-0">
          {/* Row 1: name + auth + date */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white text-sm truncate">
                {visitor.googleName || visitor.ip || "Anonymous"}
              </p>
              {visitor.authMethod && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    visitor.authMethod === "google"
                      ? "bg-blue-700/60 text-blue-200"
                      : "bg-gray-700/60 text-gray-300"
                  }`}
                >
                  {visitor.authMethod}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {visitor.dateTime}
            </span>
          </div>

          {/* Row 2: email */}
          {visitor.googleEmail && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {visitor.googleEmail}
            </p>
          )}

          {/* Row 3: location + IP */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {(visitor.city || visitor.country_name) && (
              <span className="text-xs text-gray-400">
                📍 {[visitor.city, visitor.region, visitor.country_name].filter(Boolean).join(", ")}
              </span>
            )}
            {visitor.ip && (
              <span className="text-xs text-gray-600 font-mono">
                {visitor.ip}
              </span>
            )}
            {visitor.postal && (
              <span className="text-xs text-gray-600">{visitor.postal}</span>
            )}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-500 hover:underline"
              >
                🗺 Map
              </a>
            )}
          </div>

          {/* Row 4: device + referrer */}
          {(browser || (visitor.referrer && visitor.referrer !== "Direct")) && (
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {browser && (
                <span className="text-xs text-gray-600">
                  {browser} · {os} · {deviceType}
                </span>
              )}
              {visitor.referrer && visitor.referrer !== "Direct" && (
                <span className="text-xs text-gray-600 truncate max-w-xs">
                  ↩ {visitor.referrer}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const VisitorsPanel = ({ visitors, loading, onClear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) return visitors;
    const term = searchTerm.toLowerCase();
    return visitors.filter((v) =>
      [v.ip, v.city, v.region, v.country_name, v.googleName, v.googleEmail, v.dateTime, v.authMethod]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(term)),
    );
  }, [visitors, searchTerm]);

  const sortedVisitors = useMemo(() => {
    return [...filteredVisitors].sort((a, b) => {
      const aVal = sortConfig.key === "timestamp" ? (a.timestamp?.seconds ?? 0) : (a[sortConfig.key] ?? "");
      const bVal = sortConfig.key === "timestamp" ? (b.timestamp?.seconds ?? 0) : (b[sortConfig.key] ?? "");
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredVisitors, sortConfig]);

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentItems = sortedVisitors.slice(indexOfFirst, indexOfLast);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#1e2530] rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex mb-4 justify-between items-center gap-2 flex-wrap">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder="Search visitors..."
          className="flex-1 min-w-0 max-w-xs bg-[#252b32] text-white placeholder-gray-400 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-green-500"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort pills */}
          <div className="flex items-center gap-1">
            {SORT_KEYS.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  sortConfig.key === key
                    ? "bg-green-700 text-white"
                    : "bg-[#252b32] text-gray-400 hover:text-white"
                }`}
              >
                {label}
                {sortConfig.key === key && (
                  <span className="ml-0.5">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
          </div>
          {searchTerm && (
            <span className="text-sm text-gray-500">
              {filteredVisitors.length} result{filteredVisitors.length !== 1 ? "s" : ""}
            </span>
          )}
          {visitors.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs bg-red-600/10 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-lg hover:bg-red-600/20 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {sortedVisitors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🌍</p>
          <p>No visitors found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentItems.map((v, i) => (
            <VisitorRow key={v.id} visitor={v} index={i} />
          ))}
        </div>
      )}

      <Pagination
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={sortedVisitors.length}
        paginate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
      />
    </div>
  );
};

export default VisitorsPanel;