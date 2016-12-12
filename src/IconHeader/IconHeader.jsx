import React, { Component } from 'react';
import { widgetModule } from 'kambi-widget-core-library';

const IconHeader = ({ iconPath, title, subtitle }) => {
   return (
      <header className='KambiWidget-card-border-color KambiWidget-font kw-header l-flexbox l-align-center l-pl-16'>
         <img role='presentation' className='kw-header-logo' src={iconPath} />
         <div className='kw-header-text-container'>
            <div className='kw-header-title text-truncate'>{title}</div>
            <div className='kw-header-tagline text-truncate'>{subtitle}</div>
         </div>
      </header>);
};

IconHeader.propTypes = {
   iconPath: React.PropTypes.string,
   title: React.PropTypes.string,
   subtitle: React.PropTypes.string,
};

export default IconHeader;
