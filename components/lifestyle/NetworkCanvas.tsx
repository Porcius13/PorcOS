"use client";

import React from "react";
import { motion } from "framer-motion";
import { NetworkNode as NodeData } from "./lib/network-db";

interface NetworkCanvasProps {
  nodes: NodeData[];
}

export function NetworkCanvas({ nodes }: NetworkCanvasProps) {
  // Find all unique connections to avoid double drawing
  const connections = nodes.flatMap(node => 
    node.connections.map(targetId => {
      const targetNode = nodes.find(n => n.id === targetId);
      if (!targetNode) return null;
      
      // Ensure we only draw once by sorting IDs
      const pair = [node.id, targetId].sort();
      return { 
        id: pair.join('-'), 
        from: node.position, 
        to: targetNode.position,
        type: node.type,
        affinity: node.affinity || 85 // Capture affinity for pulse speed
      };
    })
  ).filter((conn, index, self) => 
    conn !== null && self.findIndex(c => c?.id === conn.id) === index
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
      {/* ... defs ... */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((conn) => {
        const from = conn!.from;
        const to = conn!.to;
        const affinity = conn!.affinity;
        
        // Speed: 100 affinity = 1s, 0 affinity = 4s
        const duration = 4 - (affinity / 100) * 3;
        // Color: High affinity = amber/gold, lower = white
        const sparkColor = affinity > 90 ? "#f59e0b" : affinity > 60 ? "#fff" : "#a3a3a3";

        // Calculate curve - subtle Bezier
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        const cpX = midX - dy * 0.1;
        const cpY = midY + dx * 0.1;

        const pathData = `M ${from.x + 40} ${from.y + 40} Q ${cpX + 40} ${cpY + 40} ${to.x + 40} ${to.y + 40}`;

        return (
          <g key={conn!.id}>
            <motion.path
              d={pathData}
              fill="none"
              stroke={sparkColor}
              strokeWidth="1"
              strokeOpacity={0.05 + (affinity / 100) * 0.15}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.1 }}
            />
            <motion.circle
              r={1.5 + (affinity / 100) * 1.5}
              fill={sparkColor}
              filter="url(#glow)"
              className="pulse-spark"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{ 
                offsetDistance: ["0%", "100%"],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: duration, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * duration
              }}
              style={{ 
                offsetPath: `path("${pathData}")`,
                offsetRotate: "auto"
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
