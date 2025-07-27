
import React from 'react';

const NotionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12.586 6.586L9.757 3.757L8.343 5.172L12.172 9H10v9h2v-7.828l3.657 3.657l1.414-1.414L13.414 9.757l3.415-3.414l-1.414-1.414L12 8.414V6.586z" />
    <path d="M5.172 8.343L3.757 9.757L7.414 13.414l-3.657 3.657l1.414 1.414L9 14.828V18h2v-3.172L6.586 10.243l-1.414-1.9z" />
  </svg>
);

export default NotionIcon;
