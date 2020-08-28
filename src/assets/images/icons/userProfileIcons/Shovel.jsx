import React from "react";

function Icon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      width="32px"
      height="32px"
      enableBackground="new 0 0 448 448"
      version="1.1"
      viewBox="0 0 448 448"
      xmlSpace="preserve"
    >
      <path 
      fill={props.color ? props.color: "black"}
      d="M335.952 239.824c-23.12-7.36-50.368-12.448-79.952-14.624V103.12c19.056-11.088 32-31.488 32-55.12V0H160v48c0 23.632 12.944 44.032 32 55.12V225.2c-29.648 2.192-56.784 7.36-80 14.8v80c0 30.672 16.256 95.872 112 128 96.256-32.128 112-96.672 112-128l-.048-80.176zM176 16h96v16h-96V16zm0 32h96c0 26.464-21.536 48-48 48s-48-21.536-48-48zm32 160v-98.256c5.136 1.328 10.448 2.256 16 2.256s10.864-.928 16-2.256V208h-32zm32 16v16.88c0 28.88 0 52.624-16 72.496-16-19.872-16-43.616-16-72.496V224h32zm80 96c0 18.208-7.024 79.232-95.984 111.072C135.024 399.072 128 338.176 128 320v-68.064c19.504-5.328 40.992-8.864 64-10.64 0 35.616.128 68.16 32 94.704 31.888-26.544 32-59.104 32-94.736 22.768 1.744 44.656 5.328 64 10.544V320z"></path>
    </svg>
  );
}

export default Icon;