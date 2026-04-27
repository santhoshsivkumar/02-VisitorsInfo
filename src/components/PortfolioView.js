// src/components/PortfolioView.js
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import TopVisitors from "./portfolio/TopVisitors";
import ChatCards from "./portfolio/ChatCards";
import AlertCards from "./portfolio/AlertCards";
import VisitorsPanel from "./portfolio/VisitorsPanel";

const SUB_TAB_KEY = "portfolio_sub_tab";
const staticEmail = process.env.REACT_APP_STATIC_EMAIL;
const staticPassword = process.env.REACT_APP_STATIC_PASSWORD;

const PortfolioView = () => {
  const [visitors, setVisitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [subTab, setSubTab] = useState(
    () => localStorage.getItem(SUB_TAB_KEY) || "overview",
  );
  const [showClearPopup, setShowClearPopup] = useState(null); // null | "visitors" | "events"
  const [clearEmail, setClearEmail] = useState("");
  const [clearPassword, setClearPassword] = useState("");

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, "Portfolio Visitors")),
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort(
            (a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0),
          );
        setVisitors(data);
        setLoadingVisitors(false);
      },
    );
    const unsub2 = onSnapshot(
      query(collection(db, "Portfolio Events")),
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort(
            (a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0),
          );
        setEvents(data);
        setLoadingEvents(false);
      },
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const chatbotEvents = useMemo(
    () => events.filter((e) => e.source === "chatbot"),
    [events],
  );
  const intrusionEvents = useMemo(
    () => events.filter((e) => e.source === "admin_intrusion"),
    [events],
  );

  const stats = useMemo(() => {
    const total = visitors.length;
    const uniqueUsers = new Set(
      visitors.map((v) => v.googleEmail || v.ip).filter(Boolean),
    ).size;
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const today = visitors.filter((v) =>
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
    return {
      total,
      uniqueUsers,
      today,
      topCountry,
      chats: chatbotEvents.length,
      alerts: intrusionEvents.length,
    };
  }, [visitors, chatbotEvents, intrusionEvents]);

  // Group Portfolio Visitors by email (signed-in) or IP (anonymous) → leaderboard
  const topVisitors = useMemo(() => {
    const map = {};
    [...visitors].forEach((v) => {
      const key = v.googleEmail || v.ip || "unknown";
      if (!map[key]) {
        map[key] = {
          key,
          count: 0,
          googleName: v.googleName || null,
          googleEmail: v.googleEmail || null,
          googlePhotoUrl: v.googlePhotoUrl || null,
          ip: v.ip,
          country_name: v.country_name,
          city: v.city,
          authMethod: v.authMethod,
          lastSeen: v.dateTime,
          userAgent: v.userAgent,
          referrer: v.referrer,
          _lastTs: 0,
        };
      }
      map[key].count += 1;
      const ts = v.timestamp?.seconds ?? 0;
      if (ts > map[key]._lastTs) {
        map[key]._lastTs = ts;
        map[key].lastSeen = v.dateTime;
        // Update latest profile data if newly available
        if (v.googlePhotoUrl) map[key].googlePhotoUrl = v.googlePhotoUrl;
        if (v.googleName) map[key].googleName = v.googleName;
        if (v.country_name) map[key].country_name = v.country_name;
        if (v.city) map[key].city = v.city;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [visitors]);

  const switchSubTab = (tab) => {
    localStorage.setItem(SUB_TAB_KEY, tab);
    setSubTab(tab);
  };

  const handleClear = async () => {
    if (clearEmail !== staticEmail || clearPassword !== staticPassword) {
      alert("Invalid credentials: Access Denied");
      return;
    }
    const colName =
      showClearPopup === "events" ? "Portfolio Events" : "Portfolio Visitors";
    const snap = await getDocs(collection(db, colName));
    const batch = writeBatch(db);
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (showClearPopup === "visitors") setVisitors([]);
    else setEvents([]);
    setClearEmail("");
    setClearPassword("");
    setShowClearPopup(null);
  };

  const SUB_TABS = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "visitors", label: "Visitors", icon: "🌍" },
    {
      key: "chats",
      label: "Chats",
      icon: "💬",
      count: chatbotEvents.length,
      countColor: "bg-teal-500",
    },
    {
      key: "alerts",
      label: "Alerts",
      icon: "🚨",
      count: intrusionEvents.length,
      countColor: "bg-red-500",
    },
  ];

  const STATS = [
    {
      label: "Total Visits",
      value: stats.total,
      color: "from-green-800 to-green-700",
    },
    {
      label: "Unique Users",
      value: stats.uniqueUsers,
      color: "from-blue-800 to-blue-700",
    },
    {
      label: "Today",
      value: stats.today,
      color: "from-purple-800 to-purple-700",
    },
    {
      label: "Top Country",
      value: stats.topCountry,
      color: "from-yellow-800 to-yellow-700",
    },
    { label: "Chats", value: stats.chats, color: "from-teal-800 to-teal-700" },
    {
      label: "Intrusions",
      value: stats.alerts,
      color: "from-red-900 to-red-800",
    },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 flex-wrap">
        {SUB_TABS.map(({ key, label, icon, count, countColor }) => (
          <button
            key={key}
            onClick={() => switchSubTab(key)}
            className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              subTab === key
                ? "bg-green-600 text-white shadow-lg"
                : "bg-[#252b32] text-gray-300 hover:bg-[#2e3540]"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {count != null && count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${countColor} text-white ml-0.5`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
        {STATS.map(({ label, value, color }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} rounded-lg p-2 sm:p-3 text-center`}
          >
            <p className="text-[10px] sm:text-xs font-medium text-white/70 uppercase tracking-wide mb-0.5 truncate">
              {label}
            </p>
            <p className="text-base sm:text-xl font-bold text-white truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Sub-tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {subTab === "overview" && (
            <TopVisitors
              topVisitors={topVisitors}
              loading={loadingVisitors}
              recentVisitors={visitors.slice(0, 6)}
            />
          )}
          {subTab === "visitors" && (
            <VisitorsPanel
              visitors={visitors}
              loading={loadingVisitors}
              onClear={() => setShowClearPopup("visitors")}
            />
          )}
          {subTab === "chats" && (
            <ChatCards
              events={chatbotEvents}
              loading={loadingEvents}
              onClear={() => setShowClearPopup("events")}
            />
          )}
          {subTab === "alerts" && (
            <AlertCards events={intrusionEvents} loading={loadingEvents} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Clear confirmation popup */}
      <AnimatePresence>
        {showClearPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1e2530] border border-gray-700 p-6 rounded-xl shadow-2xl w-80"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-bold text-white mb-1">
                Clear {showClearPopup === "events" ? "Events" : "Visitor"} Data
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                This action is permanent and cannot be undone.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={clearEmail}
                onChange={(e) => setClearEmail(e.target.value)}
                className="mb-3 p-2 bg-[#252b32] border border-gray-600 text-white rounded w-full focus:outline-none focus:border-green-500 text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={clearPassword}
                onChange={(e) => setClearPassword(e.target.value)}
                className="mb-4 p-2 bg-[#252b32] border border-gray-600 text-white rounded w-full focus:outline-none focus:border-green-500 text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm transition-colors"
                  onClick={() => {
                    setShowClearPopup(null);
                    setClearEmail("");
                    setClearPassword("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 text-sm transition-colors"
                  onClick={handleClear}
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

export default PortfolioView;
