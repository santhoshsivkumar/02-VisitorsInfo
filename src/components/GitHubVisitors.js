// src/GitHubVisitors.js
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import Pagination from "./Pagination";
import ListView from "./ListView";
import TableView from "./TableView";
import PortfolioView from "./PortfolioView";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";

const githubColumns = [
  { header: "ID", sortKey: null, accessor: (v, sid, i) => sid + i },
  { header: "IP Address", sortKey: "ip", accessor: (v) => v.ip },
  { header: "City", sortKey: "city", accessor: (v) => v.city },
  { header: "Region", sortKey: "region", accessor: (v) => v.region },
  {
    header: "Country",
    sortKey: "country_name",
    accessor: (v) => v.country_name,
  },
  { header: "Postal Code", sortKey: "postal", accessor: (v) => v.postal },
  { header: "Date & Time", sortKey: "timestamp", accessor: (v) => v.dateTime },
];

const staticEmail = process.env.REACT_APP_STATIC_EMAIL;
const staticPassword = process.env.REACT_APP_STATIC_PASSWORD;
const MAIN_TAB_KEY = "visitors_main_tab";

const GitHubVisitors = () => {
  // Migrate old tab key values to new format
  const initTab = () => {
    const saved = localStorage.getItem(MAIN_TAB_KEY);
    if (!saved) return "portfolio";
    return saved === "github" ? "github" : "portfolio";
  };

  const [mainTab, setMainTab] = useState(initTab);

  // ── GitHub tab state ──────────────────────────────────────────────────────
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (mainTab !== "github") return;
    setLoading(true);
    setCurrentPage(1);
    setSearchTerm("");
    setExpandedId(null);
    setSortConfig({ key: null, direction: "asc" });

    const unsubscribe = onSnapshot(
      query(collection(db, "Github Visitors")),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort(
            (a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0),
          );
        setVisitors(data);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [mainTab]);

  const deleteGithubData = async () => {
    if (email === staticEmail && password === staticPassword) {
      setVisitors([]);
      const snap = await getDocs(collection(db, "Github Visitors"));
      const batch = writeBatch(db);
      snap.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } else {
      alert("Invalid credentials: Access Denied");
    }
  };

  const stats = useMemo(() => {
    const total = visitors.length;
    const uniqueIPs = new Set(visitors.map((v) => v.ip).filter(Boolean)).size;
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const todayCount = visitors.filter((v) =>
      v.dateTime?.startsWith(todayStr),
    ).length;
    const countryCounts = {};
    visitors.forEach((v) => {
      if (v.country_name)
        countryCounts[v.country_name] =
          (countryCounts[v.country_name] || 0) + 1;
    });
    const topCountry =
      Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total, uniqueIPs, todayCount, topCountry };
  }, [visitors]);

  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) return visitors;
    const term = searchTerm.toLowerCase();
    return visitors.filter((v) =>
      [v.ip, v.city, v.region, v.country_name, v.postal, v.dateTime]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(term)),
    );
  }, [visitors, searchTerm]);

  const sortedVisitors = useMemo(() => {
    if (!sortConfig.key) return filteredVisitors;
    return [...filteredVisitors].sort((a, b) => {
      const aVal =
        sortConfig.key === "timestamp"
          ? (a.timestamp?.seconds ?? 0)
          : (a[sortConfig.key] ?? "");
      const bVal =
        sortConfig.key === "timestamp"
          ? (b.timestamp?.seconds ?? 0)
          : (b[sortConfig.key] ?? "");
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredVisitors, sortConfig]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = sortedVisitors.slice(indexOfFirst, indexOfLast);
  const startingID = (currentPage - 1) * itemsPerPage + 1;

  const paginate = (page) => {
    setCurrentPage(page);
    setExpandedId(null);
  };

  const handleSort = (key) => {
    if (!key) return;
    setExpandedId(null);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const emptyRows = itemsPerPage - currentItems.length;
  const fillEmptyRows = Array.from({ length: emptyRows }, (_, i) => (
    <tr key={`empty-${i}`} className="bg-[#252b32] text-center">
      {githubColumns.map((_, ci) => (
        <td key={ci} className="px-4 py-2">
          <p className="text-transparent">Empty</p>
        </td>
      ))}
    </tr>
  ));

  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

  const switchTab = (tab) => {
    localStorage.setItem(MAIN_TAB_KEY, tab);
    setMainTab(tab);
  };

  return (
    <div className="container mx-auto px-4 my-4 relative">
      {/* Title */}
      <motion.h1
        className="text-4xl text-center font-bold mb-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Visitors
      </motion.h1>

      {/* Main tab bar */}
      <motion.div
        className="flex justify-center items-center gap-8 mb-6 border-b border-gray-800 pb-0 relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {[
          { key: "portfolio", label: "Portfolio" },
          { key: "github", label: "GitHub" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`text-base font-bold pb-3 transition-all border-b-2 -mb-px ${
              mainTab === key
                ? "border-green-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}

        {/* Refresh */}
        <button
          onClick={() => window.location.reload()}
          title="Refresh"
          className="absolute right-0 bottom-2 text-gray-500 hover:text-white transition-colors"
        >
          ↻
        </button>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {mainTab === "github" && (
          <motion.div
            key="github"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* GitHub Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { label: "Total", value: stats.total, color: "bg-green-700" },
                {
                  label: "Unique IPs",
                  value: stats.uniqueIPs,
                  color: "bg-blue-700",
                },
                {
                  label: "Today",
                  value: stats.todayCount,
                  color: "bg-purple-700",
                },
                {
                  label: "Top Country",
                  value: stats.topCountry,
                  color: "bg-yellow-700",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`${color} text-white rounded p-2 text-center`}
                >
                  <p className="text-xs font-semibold uppercase opacity-80">
                    {label}
                  </p>
                  <p className="text-lg font-bold truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex mb-4 text-white justify-between items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  setExpandedId(null);
                }}
                placeholder="Search visitors..."
                className="flex-1 max-w-xs bg-[#252b32] text-white placeholder-gray-400 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-green-500"
              />
              <div className="flex items-center gap-3">
                {searchTerm && (
                  <span className="text-sm text-gray-400">
                    {filteredVisitors.length} result
                    {filteredVisitors.length !== 1 ? "s" : ""}
                  </span>
                )}
                {visitors.length > 0 && (
                  <button
                    className="bg-red-500 text-white p-1 px-2 rounded text-sm"
                    onClick={() => setShowPopup(true)}
                  >
                    Clear <span className="hidden sm:inline-block">Data</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table / List */}
            {isDesktop ? (
              <TableView
                columns={githubColumns}
                loading={loading}
                currentItems={currentItems}
                startingID={startingID}
                fillEmptyRows={fillEmptyRows}
                sortConfig={sortConfig}
                onSort={handleSort}
                expandedId={expandedId}
                onExpand={(id) =>
                  setExpandedId((prev) => (prev === id ? null : id))
                }
              />
            ) : (
              <ListView
                visitors={currentItems}
                loading={loading}
                startingID={startingID}
              />
            )}

            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={sortedVisitors.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </motion.div>
        )}

        {mainTab === "portfolio" && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <PortfolioView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub clear popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1e2530] border border-gray-700 p-6 rounded-xl shadow-2xl w-80"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-bold text-white mb-1">
                Clear GitHub Data
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                This action is permanent and cannot be undone.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-3 p-2 bg-[#252b32] border border-gray-600 text-white rounded w-full focus:outline-none focus:border-green-500 text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4 p-2 bg-[#252b32] border border-gray-600 text-white rounded w-full focus:outline-none focus:border-green-500 text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  onClick={() => {
                    setShowPopup(false);
                    setEmail("");
                    setPassword("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 text-sm"
                  onClick={() => {
                    setShowPopup(false);
                    setEmail("");
                    setPassword("");
                    deleteGithubData();
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GitHubVisitors;
