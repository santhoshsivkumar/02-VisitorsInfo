// src/components/portfolio/TopVisitors.js
import React from "react";
import { motion } from "framer-motion";
import { parseUserAgent } from "../../utils/parseUserAgent";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

const Avatar = ({
  src,
  name,
  size = "w-12 h-12",
  ring = "border-green-500",
}) => {
  const initial = (name || "?")[0].toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name || "visitor"}
        className={`${size} rounded-full object-cover border-2 ${ring} flex-shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-green-700 to-teal-700 flex items-center justify-center text-white font-bold flex-shrink-0 border-2 ${ring}`}
      style={{ fontSize: size === "w-8 h-8" ? "0.85rem" : "1.2rem" }}
    >
      {initial}
    </div>
  );
};

const TopVisitors = ({ topVisitors, loading, recentVisitors }) => {
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
    <div className="space-y-8">
      {/* ── Leaderboard ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Top Visitors</h2>
          <span className="text-xs text-gray-500">
            {topVisitors.length} unique user
            {topVisitors.length !== 1 ? "s" : ""}
          </span>
        </div>

        {topVisitors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">👁️</p>
            <p>No visitor data yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {topVisitors.slice(0, 10).map((v, index) => {
              const { browser, deviceType } = v.userAgent
                ? parseUserAgent(v.userAgent)
                : {};
              const displayName =
                v.googleName || v.googleEmail || v.ip || "Anonymous";
              const isTop3 = index < 3;

              return (
                <motion.div
                  key={v.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className={`relative flex items-center gap-2 sm:gap-4 rounded-xl p-3 sm:p-4 transition-colors ${
                    isTop3
                      ? "bg-gradient-to-r from-[#1e2530] to-[#1a2028] border border-green-800/40 hover:border-green-700/60"
                      : "bg-[#1e2530] border border-gray-700/40 hover:border-gray-600/60"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-7 sm:w-9 text-center flex-shrink-0">
                    {isTop3 ? (
                      <span className="text-xl sm:text-2xl">
                        {RANK_ICONS[index]}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar — smaller on mobile */}
                  <Avatar
                    src={v.googlePhotoUrl}
                    name={displayName}
                    size="w-9 h-9 sm:w-12 sm:h-12"
                    ring={isTop3 ? "border-green-500" : "border-gray-600"}
                  />

                  {/* Info block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-white truncate text-sm">
                        {displayName}
                      </p>
                      {v.authMethod === "google" && (
                        <span className="text-xs bg-blue-700/70 text-blue-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Google
                        </span>
                      )}
                    </div>
                    {v.googleEmail && v.googleName && (
                      <p className="text-xs text-gray-500 truncate">
                        {v.googleEmail}
                      </p>
                    )}
                    {v.country_name && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        📍 {v.city ? `${v.city}, ` : ""}
                        {v.country_name}
                      </p>
                    )}
                    {/* Browser & referrer — hidden on small screens */}
                    <div className="hidden sm:flex items-center gap-3 flex-wrap">
                      {browser && (
                        <span className="text-xs text-gray-600">
                          {browser} · {deviceType}
                        </span>
                      )}
                      {v.referrer && v.referrer !== "Direct" && (
                        <span className="text-xs text-gray-600 truncate max-w-[180px]">
                          ↩ {v.referrer}
                        </span>
                      )}
                    </div>
                    {v.lastSeen && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        {v.lastSeen}
                      </p>
                    )}
                  </div>

                  {/* Visit count badge */}
                  <div className="flex flex-col items-center flex-shrink-0 min-w-[36px] sm:min-w-[48px]">
                    <span
                      className={`text-xl sm:text-2xl font-bold ${
                        isTop3 ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      {v.count}
                    </span>
                    <span className="text-xs text-gray-600">
                      {v.count === 1 ? "visit" : "visits"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent Activity ── */}
      {recentVisitors.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentVisitors.map((v, i) => {
              const displayName =
                v.googleName || v.googleEmail || v.ip || "Anonymous";
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-[#1a1f25] rounded-lg px-4 py-2.5 border border-gray-800/60"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        i === 0 ? "bg-green-400" : "bg-gray-600"
                      }`}
                    />
                    {i < recentVisitors.length - 1 && (
                      <div className="w-px h-6 bg-gray-700 mt-1" />
                    )}
                  </div>

                  <Avatar
                    src={v.googlePhotoUrl}
                    name={displayName}
                    size="w-8 h-8"
                    ring={
                      v.authMethod === "google"
                        ? "border-blue-500"
                        : "border-gray-600"
                    }
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {v.city ? `${v.city}, ` : ""}
                      {v.country_name || v.ip}
                    </p>
                  </div>

                  {/* Date: show only time on mobile, full on desktop */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs text-gray-600 hidden sm:block">
                      {v.dateTime}
                    </span>
                    <span className="text-xs text-gray-600 sm:hidden">
                      {v.dateTime?.split(" at ")?.[1] ?? v.dateTime}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopVisitors;
