import React from 'react';

/**
 * Your polymorphic Button component.
 * @param {object} props
 * @param {React.ElementType} [props.as='button'] - The component to render, e.g., 'a', 'Link' from react-router-dom.
 */
const Button = ({
    // --- CHANGE #1: Add the 'as' prop and rename it to Component ---
    as: Component = 'button', 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    className = '', 
    disabled = false, 
    ...props // 'props' already collects other attributes like 'to'
}) => {
  const baseClasses = "flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  
  const variantClasses = {
    // You may need to adjust your Tailwind theme for these colors
    primary: "bg-primary text-white hover:bg-blue-800 focus:ring-primary disabled:bg-blue-300",
    secondary: "bg-accent text-white hover:bg-amber-600 focus:ring-accent disabled:bg-orange-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
    light: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    outline: "bg-transparent text-primary border-primary hover:bg-primary hover:text-white"
  };

  // --- CHANGE #2: Determine which props to pass based on the component type ---
  const componentProps = {
      className: `${baseClasses} ${variantClasses[variant]} ${className}`,
      disabled: disabled,
      ...props,
  };

  // The 'button' tag can receive a 'type' attribute, but a 'Link' or 'a' tag cannot.
  // We only add 'onClick' and 'type' if we are rendering a button.
  if (Component === 'button') {
      componentProps.type = type;
      componentProps.onClick = onClick;
  } else {
    // For links, onClick might be handled differently or not needed
    componentProps.onClick = onClick;
  }
  
  // --- CHANGE #3: Render the dynamic 'Component' instead of a hardcoded 'button' ---
  return (
    <Component {...componentProps}>
      {children}
    </Component>
  );
};

export default Button;