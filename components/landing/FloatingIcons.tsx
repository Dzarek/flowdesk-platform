"use client";

import { useEffect, useRef, useState } from "react";

import {
  MdFamilyRestroom,
  MdOutlineContactPhone,
  MdOutlineSolarPower,
  MdSecurity,
} from "react-icons/md";

import { FaCalendarAlt, FaTasks, FaShoppingCart } from "react-icons/fa";

import { ImTable } from "react-icons/im";
import { FaEarthAmericas } from "react-icons/fa6";

const iconGroups = [
  [MdFamilyRestroom, FaCalendarAlt, FaTasks],
  [FaShoppingCart, MdOutlineSolarPower, MdSecurity],
  [MdOutlineContactPhone, ImTable, FaEarthAmericas],
];

const DURATION = 5;
const FADE_DURATION = 0;

export default function FloatingIcons() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Referencje do trzech animacji SVG
  const motionRefs = useRef<(SVGElement | null)[]>([]);

  // Timeouty dla każdej ikony
  const timeoutRefs = useRef<(ReturnType<typeof setTimeout> | null)[]>([
    null,
    null,
    null,
  ]);

  const [dimensions, setDimensions] = useState({
    width: 1000,
    height: 1000,
  });

  // Każda pozycja ma niezależny indeks zestawu
  const [groupIndexes, setGroupIndexes] = useState([0, 0, 0]);

  const [visibility, setVisibility] = useState([true, true, true]);

  // Pomiar wymiarów sekcji
  useEffect(() => {
    const parent = svgRef.current?.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const rect = parent.getBoundingClientRect();

      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(parent);

    return () => observer.disconnect();
  }, []);

  // Obsługa zakończenia pełnego obiegu każdej ikony
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    motionRefs.current.forEach((motion, position) => {
      if (!motion) return;

      const handleRepeat = () => {
        // Anulowanie poprzedniego timeoutu
        if (timeoutRefs.current[position]) {
          clearTimeout(timeoutRefs.current[position]!);
        }

        // Fade out tylko aktualnej ikony
        setVisibility((prev) =>
          prev.map((value, index) => (index === position ? false : value)),
        );

        // Podmiana ikony po zakończeniu fade out
        timeoutRefs.current[position] = setTimeout(() => {
          setGroupIndexes((prev) =>
            prev.map((value, index) =>
              index === position ? (value + 1) % iconGroups.length : value,
            ),
          );

          // Fade in nowej ikony
          setVisibility((prev) =>
            prev.map((value, index) => (index === position ? true : value)),
          );

          timeoutRefs.current[position] = null;
        }, FADE_DURATION);
      };

      // Natywne zdarzenie SVG
      motion.addEventListener("repeatEvent", handleRepeat);

      cleanups.push(() => {
        motion.removeEventListener("repeatEvent", handleRepeat);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());

      timeoutRefs.current.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const { width, height } = dimensions;

  // Promień odpowiadający rounded-tr-[600px]
  const radius = Math.min(600, width, height);

  const k = 0.5522847498 * radius;

  const path = `
    M ${width - radius} 0
    C ${width - radius + k} 0,
      ${width} ${radius - k},
      ${width} ${radius}
    L ${width} ${height}
  `;

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <path id="iconOrbitPath" d={path} />
      </defs>

      {[0, 1, 2].map((position) => {
        const Icon = iconGroups[groupIndexes[position]][position];

        return (
          <g key={position}>
            {/* Niezależna animacja orbitalna */}
            <animateMotion
              ref={(node) => {
                motionRefs.current[position] = node;
              }}
              dur={`${DURATION}s`}
              begin={`${-(position * DURATION) / 3}s`}
              repeatCount="indefinite"
              rotate="0"
            >
              <mpath href="#iconOrbitPath" />
            </animateMotion>

            {/* Ikona z niezależnym fade */}
            <foreignObject
              x="-24"
              y="-24"
              width="48"
              height="48"
              className="overflow-visible"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full border border-[#DCE7D9]/30 bg-[#FFFEFA]/15 text-[#EAE3D0] shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-md transition-opacity ${
                  visibility[position] ? "opacity-100" : "opacity-0"
                }`}
              >
                <Icon size={18} />
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
