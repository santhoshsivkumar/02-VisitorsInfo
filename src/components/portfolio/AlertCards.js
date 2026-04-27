// src/components/portfolio/AlertCards.js
import React from "react";
import { motion } from "framer-motion";
import { parseUserAgent } from "../../utils/parseUserAgent";

const AlertCards = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#1e1215] rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">🛡️</p>
        <p className="text-gray-400 text-lg font-medium">
          No intrusion attempts
        </p>
        <p className="text-gray-600 text-sm mt-1">
          Your admin panel is secure.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-white">
          {events.length} Intrusion Attempt{events.length !== 1 ? "s" : ""}
        </h2>
        <span className="text-xs bg-red-900/50 text-red-300 border border-red-700/40 px-2 py-0.5 rounded-full">
          ⚠️ Security
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => {
          const { browser, os, deviceType } = e.userAgent
            ? parseUserAgent(e.userAgent)
            : {};
          const displayName =
            e.googleName || e.googleEmail || "Unknown Intruder";

          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-to-br from-[#1e1215] to-[#160d10] border border-red-900/60 rounded-xl p-4 hover:border-red-700/60 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {e.googlePhotoUrl ? (
                  <img
                    src={e.googlePhotoUrl}
                    alt={displayName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-red-700 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center text-xl flex-shrink-0 border-2 border-red-800">
                    ⚠️
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-bold bg-red-700/60 text-red-200 px-2 py-0.5 rounded-full uppercase tracking-wide mb-1">
                    Intrusion
                  </span>
                  <p className="font-semibold text-red-300 truncate text-sm">
                    {displayName}
                  </p>
                  {e.googleEmail && e.googleName && (
                    <p className="text-xs text-red-500/80 truncate">
                      {e.googleEmail}
                    </p>
                  )}
                  {e.googleUid && (
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      UID: {e.googleUid}
                    </p>
                  )}
                </div>
              </div>

              {/* Device info */}
              {(browser || os) && (
                <div className="mt-3 pt-3 border-t border-red-900/40 flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {[browser, os, deviceType].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}

              <p className="text-xs text-red-900 mt-2 text-right font-medium">
                {e.dateTime}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertCards;
