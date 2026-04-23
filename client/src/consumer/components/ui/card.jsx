import React from "react";

export const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-xl font-semibold ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={`px-6 pb-6 ${className}`} {...props}>
    {children}
  </div>
);
