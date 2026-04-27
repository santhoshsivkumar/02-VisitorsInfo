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
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";

const visitorColumns = [
  { header: "ID", sortKey: null, accessor: (v, sid, i) => sid + i },
  { header: "IP Address", sortKey: "ip", accessor: (v) => v.ip },
  { header: "City", sortKey: "city", accessor: (v) => v.city },
  { header: "Region", sortKey: "region", accessor: (v) => v.region },
  { header: "Country", sortKey: "country_name", accessor: (v) => v.country_name },
  { header: "Postal Code", sortKey: "postal", accessor: (v) => v.postal },
  { header: "Date & Time", sortKey: "timestamp", accessor: (v) => v.dateTime },
];

const eventColumns = [
  { header: "ID", sortKey: null, accessor: (v, sid, i) => sid + i },
  { header: "Type", sortKey: "source", accessor: (v) => v.source },
  { header: "Name", sortKey: "name", accessor: (v) => v.name || v.googleName || v.nameOrLinkedin || "—" },
  { header: "Contact", sortKey: null, accessor: (v) => v.googleEmail || v.company || v.github || "—" },
  { header: "Rating", sortKey: "rating", accessor: (v) => v.rating ? `${"★".repeat(v.rating)}${"☆".repeat(5 - v.rating)}` : "—" },
  { header: "Date & Time", sortKey: "timestamp", accessor: (v) => v.dateTime },
];

const staticEmail = process.env.REACT_APP_STATIC_EMAIL;
const staticPassword = process.env.REACT_APP_STATIC_PASSWORD;

const GitHubVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentCollection, setCurrentCollection] = useState("Github Visitors");
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    setSearchTerm("");
    setExpandedId(null);
    setSortConfig({ key: null, direction: "asc" });

    const visitorsCollection = collection(db, currentCollection);
    const q = query(visitorsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedData = visitorsData.sort(
        (a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0)
      );

      setVisitors(sortedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentCollection]);

  const deleteCollectionData = async () => {
    if (email === staticEmail && password === staticPassword) {
      setVisitors([]);
      const visitorsCollection = collection(db, currentCollection);
      const snapshot = await getDocs(visitorsCollection);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } else {
      alert("Invalid credentials : Access Denied");
    }
  };

  // Stats computed from all (unfiltered) visitors
  const stats = useMemo(() => {
    const total = visitors.length;
    const uniqueIPs = new Set(visitors.map((v) => v.ip).filter(Boolean)).size;
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const todayCount = visitors.filter(
      (v) => v.dateTime && v.dateTime.startsWith(todayStr)
    ).length;
    const countryCounts = {};
    visitors.forEach((v) => {
      if (v.country_name)
        countryCounts[v.country_name] =
          (countryCounts[v.country_name] || 0) + 1;
    });
    const topCountry =
      Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "\u2014";
    return { total, uniqueIPs, todayCount, topCountry };
  }, [visitors]);

  // Search across all meaningful fields
  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) return visitors;
    const term = searchTerm.toLowerCase();
    return visitors.filter((v) =>
      [
        v.ip, v.city, v.region, v.country_name, v.postal, v.dateTime,
        v.googleName, v.googleEmail, v.referrer,
        v.name, v.nameOrLinkedin, v.whoAreYou, v.company, v.github, v.source,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [visitors, searchTerm]);

  // Sort on top of filter
  const sortedVisitors = useMemo(() => {
    if (!sortConfig.key) return filteredVisitors;
    return [...filteredVisitors].sort((a, b) => {
      const aVal =
        sortConfig.key === "timestamp"
          ? a.timestamp?.seconds ?? 0
          : a[sortConfig.key] ?? "";
      const bVal =
        sortConfig.key === "timestamp"
          ? b.timestamp?.seconds ?? 0
          : b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredVisitors, sortConfig]);

  const columns =
    currentCollection === "Portfolio Events" ? eventColumns : visitorColumns;

  const handleSort = (key) => {
    if (!key) return;
    setExpandedId(null);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedVisitors.slice(indexOfFirstItem, indexOfLastItem);
  const startingID = (currentPage - 1) * itemsPerPage + 1;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedId(null);
  };

  const emptyRows = itemsPerPage - currentItems.length;
  const fillEmptyRows = Array.from({ length: emptyRows }, (_, index) => (
    <tr key={`empty-${index}`} className="bg-[#252b32] text-center">
      {columns.map((col, colIndex) => (
        <td key={colIndex} className="px-4 py-2">
          <p className="text-transparent">Empty</p>
        </td>
      ))}
    </tr>
  ));

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1024px)",
  });

  const switchCollection = (col) => {
    setPassword("");
    setEmail("");
    setCurrentCollection(col);
  };

  return (
    <div className="container mx-auto px-4 my-4 relative">
      <motion.h1
        className="text-4xl text-center font-bold mb-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Visitors
      </motion.h1>

      {/* Collection tabs */}
      <motion.div
        className="flex flex-col justify-center items-center w-full gap-4 mb-4 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex gap-4">
          {[
            { key: "Github Visitors", label: "GitHub" },
            { key: "Portfolio Visitors", label: "Portfolio" },
            { key: "Portfolio Events", label: "Events" },
          ].map(({ key, label }) => (
            <h1
              key={key}
              className={`text-md font-bold cursor-pointer ${
                currentCollection === key ? "border-b-2 border-b-green-600" : ""
              } px-4 py-1`}
              onClick={() => switchCollection(key)}
            >
              {label}
            </h1>
          ))}
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {[
          { label: "Total", value: stats.total, color: "bg-green-700" },
          { label: "Unique IPs", value: stats.uniqueIPs, color: "bg-blue-700" },
          { label: "Today", value: stats.todayCount, color: "bg-purple-700" },
          { label: "Top Country", value: stats.topCountry, color: "bg-yellow-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} text-white rounded p-2 text-center`}>
            <p className="text-xs font-semibold uppercase opacity-80">{label}</p>
            <p className="text-lg font-bold truncate">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Toolbar: search + clear */}
      <motion.div
        className="flex mb-4 text-white justify-between items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
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
              className="bg-red-500 text-white p-1 px-2 rounded"
              onClick={() => setShowPopup(true)}
            >
              Clear <span className="hidden sm:inline-block">Data</span>
            </button>
          )}
        </div>
      </motion.div>

      {showPopup && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-8 rounded shadow-md"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4">Enter Credentials</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            />
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => {
                  setShowPopup(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setShowPopup(false);
                  setPassword("");
                  setEmail("");
                  deleteCollectionData();
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isDesktopOrLaptop ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TableView
            columns={columns}
            loading={loading}
            currentItems={currentItems}
            startingID={startingID}
            fillEmptyRows={fillEmptyRows}
            sortConfig={sortConfig}
            onSort={handleSort}
            expandedId={expandedId}
            onExpand={handleExpand}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ListView
            visitors={currentItems}
            loading={loading}
            startingID={startingID}
          />
        </motion.div>
      )}

      {sortedVisitors.length > itemsPerPage && (
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={sortedVisitors.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default GitHubVisitors;
