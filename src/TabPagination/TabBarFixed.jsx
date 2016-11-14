import React, { Component, PropTypes } from 'react';
import styles from './TabBarFixed.scss';

/**
 * Fixed width Tab Bar component
 */
class TabBarFixed extends Component {

   /**
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);
      this.state = {
         selected: props.selected
      };
   }

   /**
    * Switches to given tab.
    * @param {number} idx Tab index
    */
   onTabClick(idx) {
      if (this.props.onTabSwitch) {
         this.props.onTabSwitch(idx);
      }

      this.setState({ selected: idx });
   }

   /**
    * Renders component.
    * @returns {XML}
    */
   render() {
      return (
         <ul className={styles.bar}>
            {this.props.children.map((child, i) => (
               <li
                  key={i}
                  className={[
                     styles.tab,
                     this.state.selected == i ? 'selected' : ''
                  ].join(' ')}
                  onClick={this.onTabClick.bind(this, i)}
               >
                  {child}
                  <i className={['KambiWidget-primary-background-color', styles.border].join(' ')} />
               </li>
            ))}
         </ul>
      );
   }
}

TabBarFixed.propTypes = {
   /**
    * Tab element
    */
   children: PropTypes.arrayOf(PropTypes.element).isRequired,

   /**
    * Tab clicked handler
    */
   onTabSwitch: PropTypes.func,

   /**
    * Selected tab index
    */
   selected: PropTypes.number
};

TabBarFixed.defaultProps = {
   selected: 0
};

export default TabBarFixed;
