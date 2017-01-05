import React, { PropTypes } from 'react';
import styles from './ItemContainer.scss';

/*
 * Returns DOM element's width (in pixels)
 * @param {HTMLElement} el DOM element
 * @returns number|null
 */
const getWidth = function(el) {
   return el ? el.offsetWidth : null;
};

const ItemContainer = ({ children, selected, onClick, onWidth }) => (
   <div
      className={[styles.item, selected ? 'selected' : ''].join(' ')}
      onClick={onClick}
      ref={onWidth ? el => onWidth(getWidth(el)) : undefined}
   >
      {children}
      <i className={['KambiWidget-primary-background-color', styles.border].join(' ')} />
   </div>
);

ItemContainer.propTypes = {
   /*
    * On click handler
    */
   onClick: PropTypes.func,

   /*
    * Is this item currently selected?
    */
   selected: PropTypes.bool,

   /*
    * Item contents
    */
   children: PropTypes.node,

   /*
    * Called when item width is known
    */
   onWidth: PropTypes.func
};

export default ItemContainer;
