// src/TableBody.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseUserAgent } from "../utils/parseUserAgent";

const Field = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-white break-all">{value}</p>
    </div>
  ) : null;

const ExpandedDetail = ({ visitor }) => {
  const { browser, os, deviceType } = visitor.userAgent
    ? parseUserAgent(visitor.userAgent)
    : {};

  const isChatbot = visitor.source === "chatbot";
  const isIntrusion = visitor.source === "admin_intrusion";

  const mapUrl =
    visitor.latitude && visitor.longitude
      ? `https://www.google.com/maps?q=${visitor.latitude},${visitor.longitude}`
      : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-[#1a1f25] text-left border-t border-gray-700">
      {/* Google profile */}
      {visitor.googlePhotoUrl && (
        <div className="flex items-center gap-3 col-span-2">
          <img
            src={visitor.googlePhotoUrl}
            alt={visitor.googleName || "Google user"}
            className="w-10 h-10 rounded-full border-2 border-green-500 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-sm text-white font-semibold">
              {visitor.googleName || "—"}
            </p>
            <p className="text-xs text-gray-400">{visitor.googleEmail || "—"}</p>
          </div>
        </div>
      )}

      {/* Auth badge */}
      {visitor.authMethod && !isChatbot && !isIntrusion && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Auth</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              visitor.authMethod === "google"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-200"
            }`}
          >
            {visitor.authMethod}
          </span>
        </div>
      )}

      {/* Browser / OS */}
      {browser && (
        <Field label="Device" value={`${browser} · ${os} · ${deviceType}`} />
      )}

      {/* Referrer */}
      <Field label="Referrer" value={visitor.referrer} />

      {/* Map link */}
      {mapUrl && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-400 hover:underline"
          >
            📍 Open on Maps
          </a>
        </div>
      )}

      {/* Chatbot-specific fields */}
      {isChatbot && (
        <>
          <Field label="Who Are You" value={visitor.whoAreYou} />
          <Field label="Name" value={visitor.name || visitor.nameOrLinkedin} />
          <Field label="Company" value={visitor.company} />
          <Field label="GitHub" value={visitor.github} />
          <Field label="Resume Action" value={visitor.resumeAction} />
          {visitor.rating != null && (
            <Field
              label="Rating"
              value={`${"★".repeat(visitor.rating)}${"☆".repeat(
                5 - visitor.rating
              )} (${visitor.rating}/5)`}
            />
          )}
          <Field
            label="Feedback"
            value={visitor.feedback || visitor.feedbackUpdated}
          />
        </>
      )}

      {/* Intrusion-specific fields */}
      {isIntrusion && (
        <>
          <Field label="Intruder Name" value={visitor.googleName} />
          <Field label="Intruder Email" value={visitor.googleEmail} />
          {browser && (
            <Field label="Device" value={`${browser} · ${os}`} />
          )}
        </>
      )}
    </div>
  );
};

const TableBody = ({
  currentItems,
  columns,
  startingID,
  fillEmptyRows,
  expandedId,
  onExpand,
}) => {
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <tbody className="border border-gray-300">
      {currentItems.map((visitor, index) => (
        <React.Fragment key={visitor.id}>
          <motion.tr
            className="hover:bg-green-900 border border-gray-300 text-center bg-[#252b32] rounded-lg h-[50px] cursor-pointer"
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{
              scale: 1.01,
              boxShadow: "0px 4px 10px rgba(0, 255, 127, 0.15)",
            }}
            onClick={() => onExpand(visitor.id)}
          >
            {columns.map((col, colIndex) => {
              const cellValue = col.accessor(visitor, startingID, index);
              const isTypeCol = col.header === "Type";
              return (
                <td key={colIndex} className="px-4 py-1 text-white">
                  {isTypeCol ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        visitor.source === "admin_intrusion"
                          ? "bg-red-600 text-white"
                          : visitor.source === "chatbot"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {cellValue}
                    </span>
                  ) : (
                    cellValue
                  )}
                </td>
              );
            })}
          </motion.tr>

          <AnimatePresence>
            {expandedId === visitor.id && (
              <motion.tr
                key={`expanded-${visitor.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <td colSpan={columns.length} className="p-0">
                  <ExpandedDetail visitor={visitor} />
                </td>
              </motion.tr>
            )}
          </AnimatePresence>
        </React.Fragment>
      ))}
      {fillEmptyRows}
    </tbody>
  );
};

export default TableBody;

