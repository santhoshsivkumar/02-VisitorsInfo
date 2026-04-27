// src/ListView.js
import React from "react";
import { motion } from "framer-motion";
import { parseUserAgent } from "../utils/parseUserAgent";

const ListView = ({ visitors, loading, startingID }) => {
  if (loading) {
    return (
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </motion.div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div>
      {visitors.map((visitor, index) => {
        const { browser, os, deviceType } = visitor.userAgent
          ? parseUserAgent(visitor.userAgent)
          : {};

        const mapUrl =
          visitor.latitude && visitor.longitude
            ? `https://www.google.com/maps?q=${visitor.latitude},${visitor.longitude}`
            : null;

        const isChatbot = visitor.source === "chatbot";
        const isIntrusion = visitor.source === "admin_intrusion";

        return (
          <motion.div
            key={visitor.id}
            className="bg-[#252b32] p-4 mb-4 rounded shadow-md text-white hover:bg-green-900"
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 1.02,
              boxShadow: "0px 8px 15px rgba(0, 255, 127, 0.2)",
            }}
          >
            {/* Header row with avatar + ID + type badge */}
            <div className="flex items-center gap-3 mb-2">
              {visitor.googlePhotoUrl && (
                <img
                  src={visitor.googlePhotoUrl}
                  alt={visitor.googleName || "user"}
                  className="w-9 h-9 rounded-full border-2 border-green-500 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex flex-col">
                <strong>ID: {startingID + index}</strong>
                {visitor.source && (
                  <span
                    className={`text-xs px-2 py-0.5 mt-0.5 rounded-full font-semibold w-fit ${
                      isIntrusion
                        ? "bg-red-600"
                        : isChatbot
                        ? "bg-blue-600"
                        : "bg-gray-600"
                    } text-white`}
                  >
                    {visitor.source}
                  </span>
                )}
              </div>
            </div>

            {/* Core location fields */}
            {visitor.ip && <p><strong>IP:</strong> {visitor.ip}</p>}
            {visitor.city && <p><strong>City:</strong> {visitor.city}</p>}
            {visitor.region && <p><strong>Region:</strong> {visitor.region}</p>}
            {visitor.country_name && <p><strong>Country:</strong> {visitor.country_name}</p>}
            {visitor.postal && <p><strong>Postal:</strong> {visitor.postal}</p>}

            {/* Auth & profile */}
            {visitor.authMethod && !isChatbot && !isIntrusion && (
              <p>
                <strong>Auth: </strong>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    visitor.authMethod === "google" ? "bg-blue-600" : "bg-gray-600"
                  } text-white`}
                >
                  {visitor.authMethod}
                </span>
              </p>
            )}
            {visitor.googleName && <p><strong>Name:</strong> {visitor.googleName}</p>}
            {visitor.googleEmail && <p><strong>Email:</strong> {visitor.googleEmail}</p>}

            {/* Device info */}
            {browser && (
              <p>
                <strong>Device:</strong> {browser} · {os} · {deviceType}
              </p>
            )}
            {visitor.referrer && <p><strong>Referrer:</strong> {visitor.referrer}</p>}

            {/* Map link */}
            {mapUrl && (
              <p>
                <strong>Location: </strong>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline"
                >
                  📍 Open on Maps
                </a>
              </p>
            )}

            {/* Chatbot fields */}
            {isChatbot && (
              <>
                {visitor.whoAreYou && <p><strong>Who:</strong> {visitor.whoAreYou}</p>}
                {(visitor.name || visitor.nameOrLinkedin) && (
                  <p><strong>Name:</strong> {visitor.name || visitor.nameOrLinkedin}</p>
                )}
                {visitor.company && <p><strong>Company:</strong> {visitor.company}</p>}
                {visitor.github && <p><strong>GitHub:</strong> {visitor.github}</p>}
                {visitor.resumeAction && <p><strong>Resume:</strong> {visitor.resumeAction}</p>}
                {visitor.rating != null && (
                  <p>
                    <strong>Rating: </strong>
                    {"★".repeat(visitor.rating)}{"☆".repeat(5 - visitor.rating)}
                    {" "}({visitor.rating}/5)
                  </p>
                )}
                {(visitor.feedback || visitor.feedbackUpdated) && (
                  <p><strong>Feedback:</strong> {visitor.feedback || visitor.feedbackUpdated}</p>
                )}
              </>
            )}

            {/* Intrusion fields */}
            {isIntrusion && (
              <>
                {visitor.googleName && <p><strong>Intruder:</strong> {visitor.googleName}</p>}
                {visitor.googleEmail && <p><strong>Email:</strong> {visitor.googleEmail}</p>}
              </>
            )}

            {visitor.dateTime && (
              <p className="mt-1 text-xs text-gray-400">{visitor.dateTime}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ListView;

