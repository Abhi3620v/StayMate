import React, { useEffect } from 'react';

/**
 * Reusable SEO tag injection component
 * 
 * @param {Object} props
 * @param {string} props.title - Page Meta Title
 * @param {string} props.description - Page Meta Description
 * @param {string} [props.canonicalUrl] - Canonical web link URL
 * @param {Object} [props.structuredData] - JSON-LD schema payload
 */
export const SEOHead = ({ title, description, canonicalUrl, structuredData }) => {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title ? `${title} | StayMate` : 'StayMate | Roommate Matching & Stays Booking';
    document.title = formattedTitle;

    // 2. Helper to set meta attributes
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // 4. Update Open Graph and Twitter Card tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);

    // 5. Update Canonical link
    const canonicalLink = canonicalUrl || window.location.href;
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'canonical');
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute('href', canonicalLink);

    // 6. Update Structured JSON-LD Data
    let scriptElement = document.getElementById('jsonld-schema');
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('id', 'jsonld-schema');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.innerHTML = JSON.stringify(structuredData);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, canonicalUrl, structuredData]);

  return null;
};

export default SEOHead;
