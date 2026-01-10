import * as React from "react"
import { SVGProps, memo } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={props.width || "1em"}
    height={props.height || "1em"}
    viewBox="0 0 75.021 67.783"
    {...props}
  >
    <g
      style={{
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.875,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeDasharray: "none",
      }}
    >
      <path
        d="M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132"
        style={{
          strokeWidth: 1.875,
          strokeDasharray: "none",
        }}
        transform="translate(29.487 10.709) scale(1.41111)"
      />
      <path
        d="M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14"
        style={{
          strokeWidth: 1.875,
          strokeDasharray: "none",
        }}
        transform="translate(29.487 10.709) scale(1.41111)"
      />
      <path
        d="M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676"
        style={{
          strokeWidth: 1.875,
          strokeDasharray: "none",
        }}
        transform="translate(29.487 10.709) scale(1.41111)"
      />
    </g>
    <g
      style={{
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 0.731147,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeDasharray: "none",
      }}
    >
      <path
        d="M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6Z"
        style={{
          strokeWidth: 0.731147,
          strokeDasharray: "none",
        }}
        transform="translate(-5.915 -9.533) scale(3.61874)"
      />
      <path
        d="M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1"
        style={{
          strokeWidth: 0.731147,
          strokeDasharray: "none",
        }}
        transform="translate(-5.915 -9.533) scale(3.61874)"
      />
    </g>
  </svg>
);

const Logo = memo(SvgComponent);
export default Logo;
