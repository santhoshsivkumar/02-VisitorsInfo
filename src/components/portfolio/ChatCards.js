// src/components/portfolio/ChatCards.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STARS = (n) => (n != null ? "★".repeat(n) + "☆".repeat(5 - n) : null);

const TYPE_STYLE = {
  Recruiter: {
    bg: "bg-blue-700/50",
    text: "text-blue-200",
    border: "border-blue-600/50",
  },
  Developer: {
    bg: "bg-purple-700/50",
    text: "text-purple-200",
    border: "border-purple-600/50",
  },
  Exploring: {
    bg: "bg-teal-700/50",
    text: "text-teal-200",
    border: "border-teal-600/50",
  },
};

const Avatar = ({ src, name }) => {
  const initial = (name || "?")[0].toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name || "visitor"}
        className="w-11 h-11 rounded-full object-cover border-2 border-teal-500 flex-shrink-0"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-700 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border-2 border-teal-600">
      {initial}
    </div>
  );
};

const ChatCards = ({ events, loading, onClear }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#1e2530] rounded-xl h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">💬</p>
        <p className="text-gray-400 text-lg font-medium">
          No chat interactions yet.
        </p>
        <p className="text-gray-600 text-sm mt-1">
          Visitors who complete the chatbot will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">
          {events.length} Chat Interaction{events.length !== 1 ? "s" : ""}
        </h2>
        <button
          onClick={onClear}
          className="text-xs bg-red-600/10 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-lg hover:bg-red-600/20 transition-colors"
        >
          Clear Events
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => {
          const displayName =
            e.googleName || e.name || e.nameOrLinkedin || "Anonymous";
          const photoSrc = e.googlePhotoUrl || null;
          const emailDisplay = e.googleEmail || null;
          const isExpanded = expandedId === e.id;
          const whoStyle = TYPE_STYLE[e.whoAreYou] || {
            bg: "bg-gray-700/40",
            text: "text-gray-300",
            border: "border-gray-600/40",
          };

          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-[#1a2028] border rounded-xl p-4 cursor-pointer transition-all select-none ${
                isExpanded
                  ? "border-teal-600/60 shadow-lg shadow-teal-900/20"
                  : "border-gray-700/40 hover:border-teal-700/40 hover:bg-[#1e2530]"
              }`}
              onClick={() =>
                setExpandedId((prev) => (prev === e.id ? null : e.id))
              }
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar src={photoSrc} name={displayName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white truncate text-sm">
                      {displayName}
                    </p>
                    {e.whoAreYou && e.whoAreYou !== "__skip__" && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${whoStyle.bg} ${whoStyle.text} border ${whoStyle.border}`}
                      >
                        {e.whoAreYou}
                      </span>
                    )}
                  </div>
                  {emailDisplay && (
                    <p className="text-xs text-teal-400/80 mt-0.5 truncate">
                      {emailDisplay}
                    </p>
                  )}
                  {e.company && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      🏢 {e.company}
                    </p>
                  )}
                  {e.github && (
                    <p className="text-xs text-blue-400 mt-0.5 truncate">
                      ⚡ {e.github}
                    </p>
                  )}
                  {e.rating != null && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-yellow-400 text-sm tracking-tight">
                        {STARS(e.rating)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {e.rating}/5
                      </span>
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <span
                  className={`text-gray-500 text-xs flex-shrink-0 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </div>

              {/* Feedback quote */}
              {(e.feedback || e.feedbackUpdated) && (
                <p className="text-sm text-gray-300 mt-3 italic border-l-2 border-teal-700 pl-3 text-xs">
                  "{e.feedback || e.feedbackUpdated}"
                </p>
              )}

              {/* Expanded detail panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-2 text-xs">
                      {e.resumeAction && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Resume</span>
                          <span className="text-gray-300">
                            {e.resumeAction}
                          </span>
                        </div>
                      )}
                      {e.googleEmail && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email</span>
                          <span className="text-gray-300 truncate ml-2">
                            {e.googleEmail}
                          </span>
                        </div>
                      )}
                      {e.ratingUpdated != null && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Updated Rating</span>
                          <span className="text-yellow-400">
                            {STARS(e.ratingUpdated)} ({e.ratingUpdated}/5)
                          </span>
                        </div>
                      )}
                      {e.feedbackUpdated &&
                        e.feedbackUpdated !== e.feedback && (
                          <div>
                            <span className="text-gray-500">
                              Updated Feedback
                            </span>
                            <p className="text-gray-300 mt-0.5 italic">
                              "{e.feedbackUpdated}"
                            </p>
                          </div>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-gray-700 mt-3 text-right">
                {e.dateTime}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatCards;
